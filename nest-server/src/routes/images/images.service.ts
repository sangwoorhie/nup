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
  HeadObjectCommand,
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
import { decode } from 'iconv-lite';
import * as sharp from 'sharp';
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

        const { width, height } = await this.getImageDimensions(file);
        const cost = this.calculateCost(width, height);

        const newImage = this.imageRepository.create({
          user: user,
          image_path: key,
          status: ImageStatus.NOT_DETECTED,
        });
        return { image: await this.imageRepository.save(newImage), cost };
      });

      const results = await Promise.all(imagePromises);
      const totalCost = results.reduce((sum, result) => sum + result.cost, 0);

      await queryRunner.commitTransaction();
      return { images: results.map((result) => result.image), totalCost };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  // 사진 장당 계산법
  // 사진 A => 1920x1080 픽셀 / 100 = 20,736 => 1000원 미만 절사 = 20,000원
  // 사진 B => 3840x2160 픽셀 / 100 = 82,944 => 1000원 미만 절사 = 82,000원
  // 사진 A + 사진 B = 20,000 + 82,000 = 102,000
  private calculateCost(width: number, height: number): number {
    const pixels = (width * height) / 100;
    return Math.ceil(pixels / 1000) * 1000;
  }

  private async getImageDimensions(
    file: Express.Multer.File,
  ): Promise<{ width: number; height: number }> {
    const metadata = await sharp(file.buffer).metadata();
    return { width: metadata.width, height: metadata.height };
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
  async viewImage(
    id: string,
    userId: string,
  ): Promise<{ imageStream: Readable; contentType: string }> {
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
      const contentType =
        response.ContentType || this.getContentType(image.image_path);

      return { imageStream: response.Body as unknown as Readable, contentType };
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

  private getContentType(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      default:
        return 'application/octet-stream'; // fallback content type
    }
  }

  // 4. 이미지 목록 보기(텍스트 형태)
  async listImages(userId: string) {
    const images = await this.imageRepository.find({
      where: { user: { id: userId } },
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const point = user.point;

    const imageDetails = await Promise.all(
      images.map(async (image) => {
        const command = new GetObjectCommand({
          Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
          Key: image.image_path,
        });

        const response = await this.s3.send(command);

        // Get image dimensions from the image stream
        const stream = response.Body as unknown as Readable;
        const buffer = await this.streamToBuffer(stream);
        const metadata = await sharp(buffer).metadata();

        const cost = this.calculateCost(metadata.width, metadata.height);

        const encodedTitle = image.image_path.split('/').pop();
        const decodedTitle = decode(
          Buffer.from(encodedTitle, 'binary'),
          'utf-8',
        );
        // const fileCreationDate = await this.getFileCreationDate(
        //   image.image_path,
        // );

        return {
          id: image.id,
          title: decodedTitle,
          cost: cost,
        };
      }),
    );

    const totalCost = imageDetails.reduce((sum, image) => sum + image.cost, 0);

    return {
      total: images.length,
      images: imageDetails,
      totalCost: totalCost,
      point: point,
    };
  }

  private streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  // 5. 이미지 목록 보기 (갤러리 형태)
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

  // 6. 이미지 삭제
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
