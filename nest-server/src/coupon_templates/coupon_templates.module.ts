import { Module } from '@nestjs/common';
import { CouponTemplatesService } from './coupon_templates.service';
import { CouponTemplatesController } from './coupon_templates.controller';

@Module({
  controllers: [CouponTemplatesController],
  providers: [CouponTemplatesService],
})
export class CouponTemplatesModule {}
