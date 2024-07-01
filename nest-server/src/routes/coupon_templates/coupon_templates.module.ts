import { Module } from '@nestjs/common';
import { CouponTemplatesService } from './coupon_templates.service';
import { CouponTemplatesController } from './coupon_templates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponTemplate } from 'src/entities/coupon_template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CouponTemplate])],
  exports: [CouponTemplatesService],
  controllers: [CouponTemplatesController],
  providers: [CouponTemplatesService],
})
export class CouponTemplatesModule {}
