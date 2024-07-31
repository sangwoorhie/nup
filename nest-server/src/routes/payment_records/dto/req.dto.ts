import { IsString, IsNumber, IsEnum, IsDate, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChargeStatus } from 'src/enums/enums';
import { Transform } from 'class-transformer';

// 사용자의 현금 충전 요청
export class CreateChargeReqDto {
  @ApiProperty({ description: '충전 금액' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: '입금자명' })
  @IsString()
  account_holder_name: string;
}

// 관리자의 상태 변경
export class AdminChargeDto {
  @ApiProperty({ description: '충전 내역 ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: '충전 상태' })
  @IsEnum(ChargeStatus)
  status: ChargeStatus;
}

// 쿠폰 발급일 기준 조회 DTO
export class DateReqDto {
  @ApiProperty({ description: '쿠폰 발급 시작일' })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  readonly start_date: Date;

  @ApiProperty({ description: '쿠폰 발급 마감일' })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  readonly end_date: Date;
}

// 요청내역 삭제
export class DeleteRecordsDto {
  @ApiProperty({ description: '삭제할 충전 내역 ID' })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
