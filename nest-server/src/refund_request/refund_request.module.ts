import { Module } from '@nestjs/common';
import { RefundRequestService } from './refund_request.service';
import { RefundRequestController } from './refund_request.controller';

@Module({
  controllers: [RefundRequestController],
  providers: [RefundRequestService],
})
export class RefundRequestModule {}
