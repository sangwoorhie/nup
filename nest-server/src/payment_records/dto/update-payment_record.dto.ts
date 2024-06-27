import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentRecordDto } from './create-payment_record.dto';

export class UpdatePaymentRecordDto extends PartialType(CreatePaymentRecordDto) {}
