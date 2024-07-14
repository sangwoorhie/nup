import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

// 환불 신청 응답 DTO (사용자의 입장)
export class RefundResDto {
  @ApiProperty({ description: '환불 신청 시각' })
  @IsDate()
  readonly requested_at: Date;

  @ApiProperty({ description: '환불신청 포인트' })
  @IsNumber()
  readonly requested_point: number;

  @ApiProperty({ description: '환불신청 후 포인트' })
  @IsNumber()
  readonly rest_point: number;
}

// 환불 신청 응답 DTO (관리자의 입장)
export class RefundResAdminDto {
  @ApiProperty({ description: '환불 신청 시각' })
  @IsDate()
  readonly requested_at: Date;

  @ApiProperty({ description: '통장 사본' })
  @IsString()
  readonly bank_account_copy: string;

  @ApiProperty({ description: '환불신청 포인트' })
  @IsNumber()
  readonly requested_point: number;

  @ApiProperty({ description: '환불신청 후 포인트' })
  @IsNumber()
  readonly rest_point: number;

  @ApiProperty({ description: '환불요청 사유' })
  @IsString()
  readonly refund_request_reason: string;

  @ApiProperty({ description: '회원 이름' })
  @IsString()
  readonly username: string;

  @ApiProperty({ description: '연락처' })
  @IsString()
  readonly phone: string;
}
