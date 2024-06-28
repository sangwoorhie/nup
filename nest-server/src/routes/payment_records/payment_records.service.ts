import { Injectable } from '@nestjs/common';
import { CreatePaymentRecordDto } from './dto/create-payment_record.dto';
import { UpdatePaymentRecordDto } from './dto/update-payment_record.dto';

@Injectable()
export class PaymentRecordsService {
  create(createPaymentRecordDto: CreatePaymentRecordDto) {
    return 'This action adds a new paymentRecord';
  }

  findAll() {
    return `This action returns all paymentRecords`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paymentRecord`;
  }

  update(id: number, updatePaymentRecordDto: UpdatePaymentRecordDto) {
    return `This action updates a #${id} paymentRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} paymentRecord`;
  }
}
