import { Module } from '@nestjs/common';
import { RefundRequestService } from './refund_request.service';
import { RefundRequestController } from './refund_request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundRequest } from 'src/entities/refund_request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RefundRequest])],
  exports: [RefundRequestService],
  controllers: [RefundRequestController],
  providers: [RefundRequestService],
})
export class RefundRequestModule {}
