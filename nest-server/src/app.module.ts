import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CorporatesModule } from './corporates/corporates.module';
import { PaymentRecordsModule } from './payment_records/payment_records.module';
import { RefundRequestModule } from './refund_request/refund_request.module';
import { CouponsModule } from './coupons/coupons.module';
import { CouponTemplatesModule } from './coupon_templates/coupon_templates.module';
import { AiModelsModule } from './ai_models/ai_models.module';
import { ApiKeysModule } from './api_keys/api_keys.module';
import { ImagesModule } from './images/images.module';
import { ApiLogsModule } from './api_logs/api_logs.module';
import { ApiKeyIpModule } from './api_key_ip/api_key_ip.module';
import { RefreshTokenModule } from './refresh_token/refresh_token.module';

@Module({
  imports: [
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
export class AppModule {}
