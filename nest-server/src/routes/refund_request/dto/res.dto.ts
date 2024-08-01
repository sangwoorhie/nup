import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { ChargeType } from 'src/enums/enums';

// 본인 현금충전 포인트 조회 DTO (사용자의 입장)
export class AmountResDto {
  @ApiProperty({ description: '이름' })
  @IsString()
  readonly username: string;

  @ApiProperty({ description: '현재 유저의 전체 포인트' })
  @IsNumber()
  readonly total_point: number;

  @ApiProperty({ description: '현재 유저의 현금충전 포인트' })
  @IsNumber()
  readonly cash_point: number;
}

// 포인트 충전 유형 조회 DTO (사용자의 입장)
export class ChargeTypeDetailsDto {
  @ApiProperty({ description: '충전 유형' })
  readonly charge_type: ChargeType;

  @ApiProperty({ description: '충전 포인트' })
  @IsNumber()
  readonly point: number;
}

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
