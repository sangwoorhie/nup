import { UsersService } from './../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  ExecutionContext,
  Inject,
  Injectable,
  LoggerService,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorators';
import { UserType } from 'src/enums/enums';
import { USER_TYPE_KEY } from 'src/decorators/usertype.decorators';
import { Logger } from 'winston';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private usersService: UsersService,
    @Inject(Logger) private logger: LoggerService,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Public route인 경우, 인증 없이 접근 허용
    if (isPublic) {
      return true;
    }

    const http = context.switchToHttp();
    const { url, headers } = http.getRequest<Request>();
    const token = /Bearer\s(.+)/.exec(headers['authorization'])[1];
    const decoded = this.jwtService.decode(token);

    // 리프레시 토큰을 사용하는지 확인하고, 리프레시 토큰이 아닌 경우 에러 발생
    if (url !== '/auth/refresh' && decoded['tokenType'] === 'refresh') {
      const error = new UnauthorizedException(`accessToken is required`);
      this.logger.error(error.message, error.stack);
      throw error;
    }

    // 특정 사용자 유형이 필요한지 확인
    const requireUsertype = this.reflector.getAllAndOverride<UserType[]>(
      USER_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 사용자 유형이 필요한 경우, 사용자가 관리자(Admin)인지 확인 (관리자만 접근 허용)
    if (requireUsertype) {
      const userId = decoded['sub'];
      const admin = this.usersService.checkUserIsAdmin(userId);
      if (!admin) throw new UnauthorizedException();
      return admin;
    }

    // 기본 AuthGuard 로직 실행
    return super.canActivate(context);
  }
}
