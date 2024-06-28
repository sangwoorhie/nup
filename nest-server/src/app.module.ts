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
import { RefreshTokenModule } from './routes/refresh_token/refresh_token.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import ConfigModule from './config/index';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
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
    RefreshTokenModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
