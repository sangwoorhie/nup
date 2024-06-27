import { PartialType } from '@nestjs/mapped-types';
import { CreateRefundRequestDto } from './create-refund_request.dto';

export class UpdateRefundRequestDto extends PartialType(CreateRefundRequestDto) {}
