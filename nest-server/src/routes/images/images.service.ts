import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Image } from 'src/entities/image.entity';
import { ImageStatus } from 'src/enums/enums';
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  NoSuchKey,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Stream } from 'stream';
import { User } from 'src/entities/user.entity';
import { PageResDto } from 'src/common/dto/res.dto';
import { ImageResDto } from './dto/res.dto';
import { uploadFileToS3 } from 'src/config/s3-storage.config';
import { createReadStream } from 'fs';
import * as archiver from 'archiver';
import { PassThrough, Readable } from 'stream';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class ImagesService {
  private s3: S3Client;

  constructor(
    private dataSource: DataSource,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.s3 = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  // 1. 이미지 파일 업로드 (다중 파일 업로드 가능)
  async uploadImages(files: Express.Multer.File[], userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user)
        throw new UnauthorizedException('회원 정보를 찾을 수 없습니다.');

      const imagePromises = files.map(async (file) => {
        const key = await uploadFileToS3(file);

        const newImage = this.imageRepository.create({
          user: user,
          image_path: key,
          status: ImageStatus.NOT_DETECTED,
        });
        return this.imageRepository.save(newImage);
      });
      return Promise.all(imagePromises);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  // 2. 이미지 파일 다운로드
  async downloadImages(imageIds: string[], zip: boolean, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    try {
      const images = await this.imageRepository.find({
        where: {
          id: In(imageIds),
        },
        relations: ['user'], // Ensure the user relationship is loaded
      });

      if (images.length === 0) {
        throw new NotFoundException('이미지를 찾을 수 없습니다.');
      }
      if (images.some((image) => image.user.id !== userId)) {
        throw new ForbiddenException(
          '본인이 업로드 한 이미지만 다운로드 받을 수 있습니다.',
        );
      }
      if (zip) {
        return this.zipImages(images);
      }

      const fileStreams = await Promise.all(
        images.map(async (image) => {
          try {
            const command = new GetObjectCommand({
              Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
              Key: image.image_path,
            });
            const response = await this.s3.send(command);
            const stream = response.Body as unknown as Readable;
            return stream;
          } catch (error) {
            if (error.name === 'NoSuchKey') {
              console.error(`File not found: ${image.image_path}`);
              throw new NotFoundException(
                `File not found: ${image.image_path}`,
              );
            } else {
              throw new InternalServerErrorException(
                'Error retrieving file from S3',
              );
            }
          }
        }),
      );
      return fileStreams;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  // 다운로드 시 파일압축
  private async zipImages(images: Image[]) {
    const passThroughStream = new PassThrough();
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Compression level
    });

    archive.pipe(passThroughStream);

    for (const image of images) {
      try {
        const command = new GetObjectCommand({
          Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
          Key: image.image_path,
        });

        const response = await this.s3.send(command);
        const stream = response.Body as unknown as Readable;
        archive.append(stream, { name: image.image_path.split('/').pop() });
      } catch (error) {
        if (error.name === 'NoSuchKey') {
          console.error(`File not found: ${image.image_path}`);
          throw new NotFoundException(`File not found: ${image.image_path}`);
        } else {
          throw new InternalServerErrorException(
            'Error retrieving file from S3',
          );
        }
      }
    }
    archive.finalize();
    return passThroughStream;
  }

  // 3. 단일 이미지 보기
  async viewImage(id: string, userId: string): Promise<Readable> {
    const image = await this.imageRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!image) {
      throw new NotFoundException('이미지를 찾을 수 없습니다.');
    }

    if (image.user.id !== userId) {
      throw new ForbiddenException(
        '본인이 업로드 한 이미지만 조회할 수 있습니다.',
      );
    }

    const command = new GetObjectCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Key: image.image_path,
    });

    try {
      const response = await this.s3.send(command);
      return response.Body as unknown as Readable;
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        throw new NotFoundException('이미지를 찾을 수 없습니다.');
      } else {
        throw new InternalServerErrorException(
          '이미지를 가져오는 중 오류가 발생했습니다.',
        );
      }
    }
  }

  // 4. 이미지 목록 보기
  async viewImages(ids: string[], userId: string): Promise<Readable[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('회원 정보를 찾을 수 없습니다.');

    const images = await this.imageRepository.find({
      where: { id: In(ids) },
      relations: ['user'],
    });
    if (images.length === 0) {
      throw new NotFoundException('이미지를 찾을 수 없습니다.');
    }
    if (images.length !== ids.length) {
      throw new NotFoundException('하나 이상의 이미지를 찾을 수 없습니다.');
    }

    const imageStreams = await Promise.all(
      images.map(async (image) => {
        const command = new GetObjectCommand({
          Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
          Key: image.image_path,
        });

        try {
          const response = await this.s3.send(command);
          return response.Body as unknown as Readable;
        } catch (error) {
          if (error.name === 'NoSuchKey') {
            throw new NotFoundException(
              `이미지를 찾을 수 없습니다: ${image.image_path}`,
            );
          } else {
            throw new InternalServerErrorException(
              '이미지를 가져오는 중 오류가 발생했습니다.',
            );
          }
        }
      }),
    );

    return imageStreams;
  }

  // 5. 이미지 삭제
  async deleteImages(
    ids: string[],
    userId: string,
  ): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user)
        throw new UnauthorizedException('회원 정보를 찾을 수 없습니다.');

      const images = await this.imageRepository.find({
        where: {
          id: In(ids),
        },
        relations: ['user'], // Ensure the user relationship is loaded
      });

      if (images.length === 0) {
        throw new NotFoundException('이미지를 찾을 수 없습니다.');
      }
      if (images.some((image) => image.user.id !== userId)) {
        throw new ForbiddenException(
          '본인이 업로드 한 이미지만 삭제할 수 있습니다.',
        );
      }

      // Delete images from S3
      const deleteObjects = images.map((image) => ({
        Key: image.image_path,
      }));

      const deleteParams = {
        Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
        Delete: {
          Objects: deleteObjects,
        },
      };
      const deleteCommand = new DeleteObjectsCommand(deleteParams);
      await this.s3.send(deleteCommand);
      await this.imageRepository.remove(images);

      await queryRunner.commitTransaction();
      return { message: '이미지를 성공적으로 삭제했습니다.' };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
      console.error(error);
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }
}
