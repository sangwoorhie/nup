import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/entities/refresh_token.entity';
import { Logger } from 'winston';
import { Corporate } from 'src/entities/corporate.entity';
import { TokenUsage } from 'src/entities/token_usage.entity';
import { ApiKeys } from 'src/entities/api_key.entity';
import { Log } from 'src/entities/log.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { MulterModule } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    UsersModule,
    MailerModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get('jwt.secret'),
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
    TypeOrmModule.forFeature([
      RefreshToken,
      Corporate,
      TokenUsage,
      ApiKeys,
      Log,
    ]),
    // MulterModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (config: ConfigService) => ({
    //     storage: diskStorage({
    //       destination: (req, file, cb) => {
    //         const dest = './uploads/profile_images';
    //         if (!fs.existsSync(dest)) {
    //           fs.mkdirSync(dest, { recursive: true });
    //         }
    //         cb(null, dest);
    //       },
    //       filename: (req, file, cb) => {
    //         const randNum = Array(8)
    //           .fill(null)
    //           .map(() => Math.round(Math.random() * 16).toString(16))
    //           .join('');

    //         cb(null, `${file.originalname}-${randNum}`);
    //       },
    //     }),
    //   }),
    // }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    Logger,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
