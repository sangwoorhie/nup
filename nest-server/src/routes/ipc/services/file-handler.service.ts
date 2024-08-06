import { Injectable } from '@nestjs/common';
import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { ReadFileDto } from '../dto/req.dto';

@Injectable()
export class FileHandlerService {
  //   async isFileExists(pathType: string, filePath: string): Promise<boolean> {
  //     const resolvedPath = path.resolve(app.getPath(pathType), filePath);
  //     return fs.existsSync(resolvedPath);
  //   }
  //   async readFile(readFileDto: ReadFileDto): Promise<string> {
  //     const { pathType, filePath, encoding } = readFileDto;
  //     const resolvedPath = path.resolve(app.getPath(pathType), filePath);
  //     return fs.readFileSync(resolvedPath, encoding);
  //   }
  // Implement other methods similarly
}
