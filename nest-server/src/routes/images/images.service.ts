import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { In, Repository } from 'typeorm';
// import { Image } from 'src/entities/image.entity';
// import { ImageStatus } from 'src/enums/enums';
// import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
// import { ConfigService } from '@nestjs/config';
// import { Stream } from 'stream';

@Injectable()
export class ImagesService {}

// @Injectable()
// export class ImagesService {
//   private s3: S3Client;

//   constructor(
//     @InjectRepository(Image)
//     private readonly imageRepository: Repository<Image>,
//     private readonly configService: ConfigService,
//   ) {
//     this.s3 = new S3Client({
//       region: this.configService.get<string>('AWS_REGION'),
//       credentials: {
//         accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
//         secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
//       },
//     });
//   }

//   // 1. 이미지 파일 업로드 (다중 파일 업로드 가능)
//   async uploadImages(files: Express.Multer.File[]) {
//     const imagePromises = files.map(file => {
//       const fileWithLocation = file as any; // Cast to any to bypass TypeScript error
//       const newImage = this.imageRepository.create({
//         image_path: fileWithLocation.location,
//         status: ImageStatus.NOT_DETECTED,
//       });
//       return this.imageRepository.save(newImage);
//     });
//     return Promise.all(imagePromises);
//   }

//   // 2. 이미지 파일 다운로드
//   async downloadImages(ids: string[]): Promise<Stream[]> {
//     const images = await this.imageRepository.find({ where: { id: In(ids) } });
//     const fileStreams = await Promise.all(images.map(async (image) => {
//       const params = {
//         Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
//         Key: image.image_path,
//       };
//       const command = new GetObjectCommand(params);
//       const { Body } = await this.s3.send(command);
//       return Body as Stream;
//     }));
//     return fileStreams;
//   }

//   // 3. 단일 이미지 보기
//   async viewImage(id: string): Promise<Image> {
//     return this.imageRepository.findOne({ where: { id } });
//   }

//   // 4. 이미지 목록 보기   
//   async viewImages(ids: string[]): Promise<Image[]> {
//     return this.imageRepository.find({ where: { id: In(ids) } });
//   }

//   // 5. 이미지 삭제
//   async deleteImages(ids: string[]) {
//     const images = await this.imageRepository.findByIds(ids);
//     const deletePromises = images.map(async (image) => {
//       const params = {
//         Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
//         Key: image.image_path,
//       };
//       const command = new DeleteObjectCommand(params);
//       await this.s3.send(command);
//       return this.imageRepository.delete({ id: image.id });
//     });
//     return Promise.all(deletePromises);
//   }

//   // 6. 이미지 수정
//   async modifyImage(id: string, updateData: Partial<Image>) {
//     await this.imageRepository.update({ id }, updateData);
//     return this.imageRepository.findOne({ where: { id } });
//   }
// }
