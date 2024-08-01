import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

// 환불 신청 요청 DTO (사용자의 입장)
export class RefundReqDto {
  @ApiProperty({ description: '환불 신청 포인트' })
  @IsNumber()
  requested_point: number;

  @ApiProperty({ description: '통장 사본' })
  @IsString()
  bank_account_copy: string;

  @ApiProperty({ description: '환불요청 사유' })
  @IsString()
  readonly refund_request_reason: string;
}
