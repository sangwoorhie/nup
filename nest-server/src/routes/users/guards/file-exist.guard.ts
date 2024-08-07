import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FileExistGuard implements CanActivate {
  // async라 Promise<boolean>으로 반환
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const filename = req.query.file;
    const filepath = '../../../../uploads/business_licenses';

    try {
      // 해당 경로에 있는 모든 파일을 가져옴
      const files = await fs.promises.readdir(filepath); // 비동기 처리를 통해 성능 저하를 최대한 막음.

      // 판별 함수를 적어도 하나라도 통과하는지 확인.
      // 여기서는 파일 이름이 `filename`으로 시작하는지 확인.
      const fileExists = files.some((file) => file.startsWith(filename));

      // `filename`으로 시작하는 파일을 가져옴.
      const filteredFiles = files.filter((fileName) =>
        fileName.startsWith(filename),
      );

      if (!fileExists) {
        // 파일이 없다면 에러 발생
        throw new BadRequestException('Error reading file');
      }

      // 라우터로 보낼 데이터 설정
      req.filenameRequest = filteredFiles;
      return true;
    } catch (err) {
      throw new NotFoundException('Error reading directory');
    }
  }
}
