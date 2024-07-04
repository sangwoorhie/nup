import { PaymentRecord } from 'src/entities/payment_record.entity';
import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from 'src/entities/coupon.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, User, PaymentRecord])],
  exports: [CouponsService],
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule {}
