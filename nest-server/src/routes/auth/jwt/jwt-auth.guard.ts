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
    if (isPublic) {
      return true;
    }

    const http = context.switchToHttp();
    const { url, headers } = http.getRequest<Request>();
    const token = /Bearer\s(.+)/.exec(headers['authorization'])[1];
    const decoded = this.jwtService.decode(token);

    if (url !== '/auth/refresh' && decoded['tokenType'] === 'refresh') {
      const error = new UnauthorizedException(`accessToken is required`);
      this.logger.error(error.message, error.stack);
      throw error;
    }

    const requireUsertype = this.reflector.getAllAndOverride<UserType[]>(
      USER_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requireUsertype) {
      const userId = decoded['sub'];
      const admin = this.usersService.checkUserIsAdmin(userId);
      if (!admin) throw new UnauthorizedException();
      return admin;
    }

    return super.canActivate(context);
  }
}
