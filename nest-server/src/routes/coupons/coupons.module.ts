import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from 'src/entities/coupon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon])],
  exports: [CouponsService],
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule {}
