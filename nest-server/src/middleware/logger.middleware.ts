import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl: url } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      this.logger.log(
        `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}

// Nest-Winston을 활용한 로깅 (지우지 말것)
// @Injectable()
// export class LoggerMiddleware implements NestMiddleware {
//   constructor(@Inject(Logger) private readonly logger: LoggerService) {}
//   use(request: Request, response: Response, next: NextFunction): void {
//     const { ip, method, originalUrl: url } = request;
//     const userAgent = request.get('user-agent') || '';

//     response.on('close', () => {
//       const { statusCode } = response;
//       const contentLength = response.get('content-length');
//       this.logger.log(
//         `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
//       );
//     });

//     next();
//   }
// }
