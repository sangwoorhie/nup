import { Injectable, NotFoundException } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly uploadPath = join(__dirname, '..', '..', 'uploads');

  constructor() {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  // 파일 저장
  saveFile(
    file: Express.Multer.File,
    type: 'profile_image' | 'business_license',
  ): string {
    const folder = join(this.uploadPath, type);
    if (!existsSync(folder)) {
      mkdirSync(folder, { recursive: true });
    }

    const filename = `${uuidv4()}-${file.originalname}`;
    const filepath = join(folder, filename);
    const writeStream = createWriteStream(filepath);
    writeStream.write(file.buffer);
    writeStream.end();

    return filename;
  }

  // 파일 경로 가져오기
  getFilepath(
    filename: string,
    type: 'profile_image' | 'business_license',
  ): string {
    const filepath = join(this.uploadPath, type, filename);
    if (!existsSync(filepath)) {
      throw new NotFoundException('File not found');
    }
    return filepath;
  }

  // 파일 읽기
  readFile(
    filename: string,
    type: 'profile_image' | 'business_license',
  ): Buffer {
    const filepath = this.getFilepath(filename, type);
    return readFileSync(filepath);
  }
}
