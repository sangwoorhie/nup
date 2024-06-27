import { Injectable } from '@nestjs/common';
import { CreateRefundRequestDto } from './dto/create-refund_request.dto';
import { UpdateRefundRequestDto } from './dto/update-refund_request.dto';

@Injectable()
export class RefundRequestService {
  create(createRefundRequestDto: CreateRefundRequestDto) {
    return 'This action adds a new refundRequest';
  }

  findAll() {
    return `This action returns all refundRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} refundRequest`;
  }

  update(id: number, updateRefundRequestDto: UpdateRefundRequestDto) {
    return `This action updates a #${id} refundRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} refundRequest`;
  }
}
