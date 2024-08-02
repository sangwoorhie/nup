import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNumber, IsNumberString, IsString } from 'class-validator';

// 환불 신청 요청 DTO (사용자의 입장)
export class RefundReqDto {
  @ApiProperty({ description: '환불 신청 포인트' })
  // @IsNumber()
  @IsNumberString()
  requested_point: number;

  @ApiProperty({ description: '통장 사본' })
  @IsString()
  bank_account_copy: string;

  @ApiProperty({ description: '환불요청 사유' })
  @IsString()
  refund_request_reason: string;
}

// 쿠폰 환불 요청일 기준 조회 DTO
export class DateReqDto {
  @ApiProperty({ description: '환불 요청 시작일' })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  readonly start_date: Date;

  @ApiProperty({ description: '환불 요청 마감일' })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  readonly end_date: Date;
}
