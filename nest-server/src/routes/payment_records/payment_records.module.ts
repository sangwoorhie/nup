import { Module } from '@nestjs/common';
import { PaymentRecordsService } from './payment_records.service';
import { PaymentRecordsController } from './payment_records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentRecord } from 'src/entities/payment_record.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentRecord, User])],
  exports: [PaymentRecordsService],
  controllers: [PaymentRecordsController],
  providers: [PaymentRecordsService],
})
export class PaymentRecordsModule {}
