import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './tables/users/users.module';
import { CorporatesModule } from './tables/corporates/corporates.module';
import { PaymentRecordsModule } from './tables/payment_records/payment_records.module';
import { RefundRequestModule } from './tables/refund_request/refund_request.module';
import { CouponsModule } from './tables/coupons/coupons.module';
import { CouponTemplatesModule } from './tables/coupon_templates/coupon_templates.module';
import { AiModelsModule } from './tables/ai_models/ai_models.module';
import { ApiKeysModule } from './tables/api_keys/api_keys.module';
import { ImagesModule } from './tables/images/images.module';
import { ApiLogsModule } from './tables/api_logs/api_logs.module';
import { ApiKeyIpModule } from './tables/api_key_ip/api_key_ip.module';
import { RefreshTokenModule } from './tables/refresh_token/refresh_token.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import ConfigModule from './config';

@Module({
  imports: [
    ConfigModule(),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
