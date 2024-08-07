import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class NoQueryGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // context로 들어온 데이터를 http request로 변환. call by ref처럼 동작한다.
    const req = context.switchToHttp().getRequest();
    const query = req.query;

    if (!(query && query.file)) {
      // 쿼리가 있는지 확인한다! 없으면 오류
      throw new HttpException("'file' Query Not Found", HttpStatus.BAD_REQUEST);
    }

    return true;
  }
}
