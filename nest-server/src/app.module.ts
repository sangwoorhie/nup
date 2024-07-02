import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './routes/users/users.module';
import { CorporatesModule } from './routes/corporates/corporates.module';
import { PaymentRecordsModule } from './routes/payment_records/payment_records.module';
import { RefundRequestModule } from './routes/refund_request/refund_request.module';
import { CouponsModule } from './routes/coupons/coupons.module';
import { CouponTemplatesModule } from './routes/coupon_templates/coupon_templates.module';
import { AiModelsModule } from './routes/ai_models/ai_models.module';
import { ApiKeysModule } from './routes/api_keys/api_keys.module';
import { ImagesModule } from './routes/images/images.module';
import { ApiLogsModule } from './routes/api_logs/api_logs.module';
import { ApiKeyIpModule } from './routes/api_key_ip/api_key_ip.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './routes/auth/auth.module';
import postgresConfig from './config/postgres.config';
import jwtConfig from './config/jwt.config';
import { Logger } from 'winston';
import swaggerConfig from './config/swagger.config';
import { config } from 'dotenv';
import { HealthModule } from './routes/health/health.module';
config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig, jwtConfig, swaggerConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let obj: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get('postgres.host'),
          port: configService.get('postgres.port'),
          database: configService.get('postgres.database'),
          username: configService.get('postgres.username'),
          password: configService.get('postgres.password'),
          autoLoadEntities: true,
        };

        // Local 환경에서만 개발 편의성을 위해 활용
        if (configService.get('STAGE') === 'local') {
          obj = Object.assign(obj, {
            synchronize: true,
            logging: true,
          });
        }
        return obj;
      },
    }),
    // Tables
    UsersModule,
    CorporatesModule,
    PaymentRecordsModule,
    RefundRequestModule,
    CouponsModule,
    CouponTemplatesModule,
    AiModelsModule,
    ApiKeysModule,
    ImagesModule,
    ApiLogsModule,
    ApiKeyIpModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
