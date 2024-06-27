import { Module } from '@nestjs/common';
import { PaymentRecordsService } from './payment_records.service';
import { PaymentRecordsController } from './payment_records.controller';

@Module({
  controllers: [PaymentRecordsController],
  providers: [PaymentRecordsService],
})
export class PaymentRecordsModule {}
