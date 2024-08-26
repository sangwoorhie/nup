import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Image } from 'src/entities/image.entity';
import { ChargeStatus, ImageStatus, PaymentType } from 'src/enums/enums';
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
import { uploadBufferToS3, uploadFileToS3 } from 'src/config/s3-storage.config';
import { createReadStream } from 'fs';
import * as archiver from 'archiver';
import { PassThrough, Readable } from 'stream';
import { decode } from 'iconv-lite';
import { createCanvas, loadImage } from 'canvas';
import * as sharp from 'sharp';
import * as ExifParser from 'exif-parser';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import { PaymentRecord } from 'src/entities/payment_record.entity';
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
    @InjectRepository(PaymentRecord)
    private readonly paymentRecordRepository: Repository<PaymentRecord>,
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
          cost: cost,
        });
        return { image: await this.imageRepository.save(newImage), cost };
      });

      const results = await Promise.all(imagePromises);
      const totalCost = results.reduce((sum, result) => sum + result.cost, 0);
      const imageCosts = results.map((result) => ({
        id: result.image.id,
        cost: result.cost,
      }));

      await queryRunner.commitTransaction();
      return {
        images: results.map((result) => result.image),
        totalCost,
        imageCosts, // Return the cost of each individual image
      };
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
  ): Promise<{ imageStream: Readable; contentType: string; cost: number }> {
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

      return {
        imageStream: response.Body as unknown as Readable,
        contentType,
        cost: image.cost,
      };
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

  // 7. 이미지 감지 및 포인트 차감 => 9번과 합쳐져야 함
  async detectImages(
    imageIds: string[],
    userId: string,
  ): Promise<{
    detectedImages: Image[];
    usedPoints: number;
    remainingPoints: number;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new UnauthorizedException('회원이 존재하지 않습니다.');

      const images = await this.imageRepository.find({
        where: { id: In(imageIds), user: { id: userId } },
      });

      if (images.length === 0) {
        throw new NotFoundException('이미지 파일을 찾을 수 없습니다.');
      }

      let totalCost = 0;

      for (const image of images) {
        // Get the image dimensions from S3
        const command = new GetObjectCommand({
          Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
          Key: image.image_path,
        });

        const response = await this.s3.send(command);
        const stream = response.Body as unknown as Readable;
        const buffer = await this.streamToBuffer(stream);
        const metadata = await sharp(buffer).metadata();

        const cost = this.calculateCost(metadata.width, metadata.height);
        totalCost += cost;
      }

      if (user.point < totalCost) {
        throw new BadRequestException('포인트가 부족합니다.');
      }

      // Deduct points and update images status
      user.point -= totalCost;
      await queryRunner.manager.save(user);

      const detectedImages = [];
      for (const image of images) {
        image.status = ImageStatus.DETECT_SUCCEED;
        image.is_detected = true;
        image.detected_at = new Date();
        detectedImages.push(await queryRunner.manager.save(image));
      }

      // Log point usage in the PaymentRecord
      const paymentRecord = this.paymentRecordRepository.create({
        user: user,
        payment_type: PaymentType.USE,
        point: -totalCost,
        user_point: user.point,
        detected_images_count: images.length,
        charge_status: ChargeStatus.CONFIRMED,
        created_at: new Date(),
      });

      await queryRunner.manager.save(paymentRecord);

      await queryRunner.commitTransaction();

      return {
        detectedImages: detectedImages,
        usedPoints: totalCost,
        remainingPoints: user.point,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  // 8. 단일 이미지 메타데이터 보기
  async getImageMetadata(
    id: string,
    userId: string,
    flightHeight?: number,
  ): Promise<any> {
    const image = await this.imageRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!image) {
      throw new NotFoundException('이미지를 찾을 수 없습니다.');
    }

    if (image.user.id !== userId) {
      throw new ForbiddenException(
        '본인이 업로드 한 이미지의 메타데이터만 조회할 수 있습니다.',
      );
    }

    const command = new GetObjectCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Key: image.image_path,
    });

    try {
      const response = await this.s3.send(command);
      const stream = response.Body as unknown as Readable;
      const buffer = await this.streamToBuffer(stream);
      const metadata = await sharp(buffer).metadata();

      // Use exif-parser to extract additional EXIF data
      const exifData = ExifParser.create(buffer).parse();
      const {
        FocalLength,
        FocalLengthIn35mmFormat,
        ExifImageWidth,
        ExifImageHeight,
        SubjectDistance,
        // Assuming these values would be extracted if available
        // SensorWidthInMm, // e.g., could be extracted from some other source or predefined
        // SensorHeightInMm // e.g., could be extracted from some other source or predefined
      } = exifData.tags;

      // Set these values according to your known camera sensor size or extract them from EXIF if available
      const SensorWidthInMm = 6.31; // Example value for a common camera sensor
      const SensorHeightInMm = 4.733; // Example value for a common camera sensor

      // Check if all required fields are available
      if (
        !FocalLength ||
        !FocalLengthIn35mmFormat ||
        !ExifImageWidth ||
        !ExifImageHeight ||
        !SubjectDistance
      ) {
        return {
          id: image.id,
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
          focalLength: FocalLength,
          focalLength35mm: FocalLengthIn35mmFormat,
          sensorWidth: SensorWidthInMm,
          sensorHeight: SensorHeightInMm,
          gsd: image.gsd || null, // Use modified GSD if available
          altitudeUsed: image.altitudeUsed || SubjectDistance || 'N/A', // Use modified altitude if available
        };
      }

      const width = ExifImageWidth;
      const height = ExifImageHeight;
      const focalLength35mm = FocalLengthIn35mmFormat; // in mm
      const distance = flightHeight || SubjectDistance; // in meters

      // Calculate the sensor diagonal in 35mm equivalent
      const sensorDiagonal35mm = Math.sqrt(36 ** 2 + 24 ** 2); // Diagonal of a 35mm sensor (~43.27 mm)
      const diagonalPixels = Math.sqrt(width ** 2 + height ** 2);

      // GSD calculation in cm/px
      const calculatedGsd =
        (distance * sensorDiagonal35mm) / (diagonalPixels * focalLength35mm);

      // Use the calculated GSD unless it has been modified
      const gsd = image.gsd ? image.gsd : (calculatedGsd * 100).toFixed(4);

      return {
        id: image.id,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        focalLength: FocalLength,
        focalLength35mm: FocalLengthIn35mmFormat,
        sensorWidth: SensorWidthInMm, // Return the actual sensor width in mm
        sensorHeight: SensorHeightInMm, // Return the actual sensor height in mm
        gsd: gsd, // Return modified or calculated GSD
        altitudeUsed: image.altitudeUsed || distance || 'N/A', // Return modified or calculated altitudeUsed
      };
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        throw new NotFoundException('이미지를 찾을 수 없습니다.');
      } else {
        throw new InternalServerErrorException(
          '이미지 메타데이터를 가져오는 중 오류가 발생했습니다.',
        );
      }
    }
  }

  // 9.특정 이미지 타일링(디텍팅) 요청 => 7번과 합쳐져야 함
  async tileImage(
    id: string,
    userId: string,
    jsonData: string,
  ): Promise<{ tileUrl: string; outputBuffer: Buffer }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    try {
      const image = await this.imageRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      if (!image) {
        throw new NotFoundException('이미지를 찾을 수 없습니다.');
      }

      if (image.user.id !== userId) {
        throw new ForbiddenException(
          '본인이 업로드한 이미지에만 타일링 요청할 수 있습니다.',
        );
      }

      const imagePath = image.image_path;

      // Fetch the image from S3
      const command = new GetObjectCommand({
        Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'), // Extract bucket name as string
        Key: imagePath,
      });
      const response = await this.s3.send(command);
      const stream = response.Body as unknown as Readable;

      // Convert stream to buffer
      const buffer = await this.streamToBuffer(stream);

      // Parse the JSON data that is already a stringified array of objects
      const crackMapArray = JSON.parse(jsonData);

      // Use sharp to draw cracks on the image
      let sharpImage = sharp(buffer);

      crackMapArray.forEach((crackMap: { DAMAGE_PATH: any[][] }) => {
        if (
          crackMap &&
          crackMap.DAMAGE_PATH &&
          Array.isArray(crackMap.DAMAGE_PATH)
        ) {
          crackMap.DAMAGE_PATH.forEach((path: any[]) => {
            if (Array.isArray(path)) {
              path.forEach((coordinate) => {
                if (Array.isArray(coordinate) && coordinate.length === 2) {
                  sharpImage = sharpImage.composite([
                    {
                      input: {
                        create: {
                          width: 1,
                          height: 1,
                          channels: 4,
                          background: { r: 255, g: 0, b: 0, alpha: 1 }, // Red color
                        },
                      },
                      top: coordinate[1],
                      left: coordinate[0],
                    },
                  ]);
                } else {
                  throw new Error(
                    'Unexpected JSON structure within coordinate array in DAMAGE_PATH',
                  );
                }
              });
            } else {
              throw new Error('Unexpected JSON structure within DAMAGE_PATH');
            }
          });
        } else {
          throw new Error('Unexpected JSON structure in DAMAGE_PATH');
        }
      });

      const outputBuffer = await sharpImage.toBuffer();

      // Upload the tiled image back to S3 (with a new path or overwrite)
      const newKey = `tiled_${imagePath}`;
      const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME'); // Extract the bucket name as a string
      await uploadBufferToS3(newKey, outputBuffer, bucketName); // Pass bucket name as a string

      // Construct the S3 URL
      const region = this.configService.get<string>('AWS_REGION');
      const tileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${newKey}`;

      // Save the tiled image URL in the database
      image.detected_at = new Date();
      image.tile_url = tileUrl;
      await this.imageRepository.save(image);

      await queryRunner.commitTransaction();
      return { tileUrl, outputBuffer };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
      console.error(e.message); // Log the error message for debugging
    } finally {
      await queryRunner.release(); // Corrected
      if (error) throw error;
    }
  }

  // 10. 수치해석 변경 (단일 이미지)
  async modifyImageMetadata(
    id: string,
    userId: string,
    updateData: { gsd?: string; altitudeUsed?: number },
  ): Promise<any> {
    const image = await this.imageRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!image) {
      throw new NotFoundException('이미지를 찾을 수 없습니다.');
    }

    if (image.user.id !== userId) {
      throw new ForbiddenException(
        '본인이 업로드한 이미지의 메타데이터만 수정할 수 있습니다.',
      );
    }

    if (updateData.gsd) {
      image.gsd = updateData.gsd;
    }

    if (updateData.altitudeUsed) {
      image.altitudeUsed = updateData.altitudeUsed;
    }

    await this.imageRepository.save(image);

    return this.getImageMetadata(id, userId); // Return the updated metadata
  }

  // 11. 수치해석 변경 (전체 이미지)
  async modifyAllImagesMetadata(
    userId: string,
    updateData: { gsd?: string; altitudeUsed?: number },
  ): Promise<any[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    try {
      const images = await this.imageRepository.find({
        where: { user: { id: userId } },
      });

      if (images.length === 0) {
        throw new NotFoundException('사용자의 이미지를 찾을 수 없습니다.');
      }

      const updatedImages = [];

      for (const image of images) {
        if (updateData.gsd) {
          image.gsd = updateData.gsd;
        }

        if (updateData.altitudeUsed) {
          image.altitudeUsed = updateData.altitudeUsed;
        }

        await this.imageRepository.save(image);

        const updatedMetadata = await this.getImageMetadata(image.id, userId);
        updatedImages.push(updatedMetadata);
      }

      return updatedImages; // Return the updated metadata for all images
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error('Error occurred while modifying all images metadata:', e);
      error = e;
      throw new InternalServerErrorException(
        'Failed to modify all images metadata',
      ); // Provide a meaningful error message
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }
}
