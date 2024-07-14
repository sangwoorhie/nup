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
import { Request } from 'express';

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
    // Allow access without authentication for public routes
    if (isPublic) {
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const { url, headers } = request;
    const authorization = headers['authorization'];

    if (!authorization) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    const decoded = this.jwtService.decode(token);
    if (!decoded) {
      throw new UnauthorizedException('Invalid token');
    }

    // Check if the token is a refresh token and only allow it on the /auth/refresh route
    if (url !== '/auth/refresh' && decoded['tokenType'] === 'refresh') {
      const error = new UnauthorizedException('accessToken is required');
      this.logger.error(error.message, error.stack);
      throw error;
    }

    // Check if specific user types are required
    const requireUsertype = this.reflector.getAllAndOverride<UserType[]>(
      USER_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requireUsertype) {
      const userId = decoded['sub'];
      const admin = this.usersService.checkUserIsAdmin(userId);
      if (!admin) {
        throw new UnauthorizedException();
      }
      request.user = { id: userId, ...decoded };
      return admin;
    }

    // Attach the user object to the request and proceed
    request.user = { id: decoded['sub'], ...decoded };
    return super.canActivate(context);
  }
}

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {
//   constructor(
//     private reflector: Reflector,
//     private jwtService: JwtService,
//     private usersService: UsersService,
//   ) {
//     super();
//   }
//   canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
//     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);
    
//     if(isPublic) {
//       return true;
//     }

//     const http = context.switchToHttp();
//     const { url, headers } = http.getRequest<Request>();
//     const token = /Bearer\s(.+)/.exec(headers['authorization'])[1];
//     const decoded = this.jwtService.decode(token)

//     if(url !== '/auth/refresh' && decoded['tokenType'] === 'refresh') {
//       console.error('accessToken is required')
//       throw new UnauthorizedException();
//     }

//     const requireUsertype = this.reflector.getAllAndOverride<UserType[]>(
//       USER_TYPE_KEY,
//       [context.getHandler(), context.getClass()],
//     );

//     if(requireUsertype) {
//       const userId = decoded['sub'];
//       return this.usersService.checkUserIsAdmin(userId);
//     }

//     return super.canActivate(context);
//   }

// }