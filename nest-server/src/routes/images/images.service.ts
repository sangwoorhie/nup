import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Image } from 'src/entities/image.entity';
import { ImageStatus } from 'src/enums/enums';
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Stream } from 'stream';
import { User } from 'src/entities/user.entity';
import { PageResDto } from 'src/common/dto/res.dto';
import { ImageResDto } from './dto/res.dto';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import { S3 } from 'aws-sdk';

@Injectable()
export class ImagesService {
  private s3: S3Client;

  constructor(
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
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('회원 정보를 찾을 수 없습니다.');

    const imagePromises = files.map(async (file) => {
      const uploadResult = await this.uploadToS3(file);
      const newImage = this.imageRepository.create({
        user: user,
        image_path: uploadResult.Key,
        status: ImageStatus.NOT_DETECTED,
      });
      return this.imageRepository.save(newImage);
    });
    return Promise.all(imagePromises);
  }

  // 2. 이미지 파일 다운로드
  async downloadImages(ids: string[], userId: string): Promise<Stream[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('회원 정보를 찾을 수 없습니다.');

    const images = await this.imageRepository.find({ where: { id: In(ids) } });
    return Promise.all(
      images.map(async (image) => {
        const params = {
          Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
          Key: image.image_path,
        };
        const command = new GetObjectCommand(params);
        const { Body } = await this.s3.send(command);
        return Body as Stream;
      }),
    );
  }

  // 3. 단일 이미지 보기
  async viewImage(id: string, userId: string): Promise<Buffer> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('회원 정보를 찾을 수 없습니다.');

    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) throw new NotFoundException('이미지를 찾을 수 없습니다.');

    const params = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Key: image.image_path,
    };
    const command = new GetObjectCommand(params);
    const { Body } = await this.s3.send(command);
    return this.streamToBuffer(Body as Stream);
  }

  // 4. 이미지 목록 보기
  async viewImages(
    page: number,
    size: number,
    ids: string[],
    userId: string,
  ): Promise<PageResDto<ImageResDto>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('회원 정보를 찾을 수 없습니다.');

    const [items, total] = await this.imageRepository.findAndCount({
      where: {
        id: In(ids),
        user: { id: userId },
      },
      skip: (page - 1) * size,
      take: size,
      order: { created_at: 'DESC' },
    });

    const mappedItems = items.map((item) => new ImageResDto(item));

    return {
      page,
      size,
      total,
      items: mappedItems,
    };
  }

  // 5. 이미지 삭제
  async deleteImages(
    ids: string[],
    userId: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('회원 정보를 찾을 수 없습니다.');

    const images = await this.imageRepository.findBy({ id: In(ids) });
    const deletePromises = images.map(async (image) => {
      await this.deleteFromS3(image.image_path);
      return this.imageRepository.delete({ id: image.id });
    });
    await Promise.all(deletePromises);
    return { message: '이미지가 삭제되었습니다.' };
  }

  // 6. 이미지 수정
  async modifyImage(
    id: string,
    updateData: Partial<Image>,
    userId: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('회원 정보를 찾을 수 없습니다.');

    await this.imageRepository.update({ id }, updateData);
    return { message: '이미지 정보가 수정되었습니다.' };
  }

  private async uploadToS3(file: Express.Multer.File): Promise<{ Key: string }> {
    const key = `${Date.now()}-${file.originalname}`;
    const params = {
        Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    const command = new PutObjectCommand(params);
    await this.s3.send(command);
    return { Key: key };
}
  private async deleteFromS3(key: string): Promise<void> {
    const params = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Key: key,
    };
    await this.s3.send(new DeleteObjectCommand(params));
  }

  private async streamToBuffer(stream: Stream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
