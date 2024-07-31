import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { ChargeStatus, ChargeType } from 'src/enums/enums';

// 관리자입장에서 사용자의 현금충전요청 목록
export class AdminChargeResDto {
  // 거래 ID
  @ApiProperty({ description: '거래 ID' })
  @IsUUID()
  id: string;

  // 충전 유형
  @ApiProperty({ description: '현금충전' })
  readonly charge_type: ChargeType;

  // 계좌주 이름 (현금 충전의 경우)
  @ApiProperty({ description: '계좌주 이름' })
  @IsString()
  readonly account_holder_name: string;

  // 거래 포인트 (충전은 양수, 사용은 음수)
  @ApiProperty({ description: '거래 포인트' })
  @IsNumber()
  readonly point: number;

  // 유저 포인트
  @ApiProperty({ description: '유저의 포인트' })
  @IsNumber()
  readonly user_point: number;

  // 거래 상태
  @ApiProperty({ description: '거래 상태' })
  @IsEnum({
    type: 'enum',
    enum: ChargeStatus,
    default: ChargeStatus.PENDING,
  })
  readonly charge_status: ChargeStatus;

  // 거래 발생시각
  @ApiProperty({ description: '거래 발생시각' })
  @IsDate()
  readonly created_at: Date;

  // 회원명 (사업자회원일 경우 기업명)
  @ApiProperty({ description: '회원명 (사업자회원일 경우 기업명)' })
  @IsString()
  readonly username: string;

  // 연락처
  @ApiProperty({ description: '연락처' })
  @IsString()
  readonly phone: string;

  // 이메일
  @ApiProperty({ description: '이메일' })
  @IsString()
  readonly email: string;
}

// 사용자 입장에서 본인의 충전 내역
export class ChargeResDto {
  // 거래 ID
  @ApiProperty({ description: '거래 ID' })
  @IsUUID()
  id: string;

  // 충전 유형
  @ApiProperty({ description: '충전 유형' })
  readonly charge_type: ChargeType;

  // 충전 상태
  @ApiProperty({ description: '충전 상태' })
  @IsEnum({
    type: 'enum',
    enum: ChargeStatus,
    default: ChargeStatus.PENDING,
  })
  readonly charge_status: ChargeStatus;

  // 유저 포인트
  @ApiProperty({ description: '유저의 포인트' })
  @IsNumber()
  readonly user_point: number;

  // 충전 금액
  @ApiProperty({ description: '충전 금액' })
  @IsNumber()
  readonly amount: number;

  // 충전 포인트
  @ApiProperty({ description: '충전 포인트' })
  @IsNumber()
  readonly point: number;

  // 충전 일시
  @ApiProperty({ description: '충전 일시' })
  // @IsDate()
  readonly created_at: string; // Date()
}

// 관리자 입장에서 사용자의 충전내역 조회
export class ChargeResAdminDto {
  // 거래 ID
  @ApiProperty({ description: '거래 ID' })
  @IsUUID()
  id: string;

  // 충전 유형
  @ApiProperty({ description: '충전 유형' })
  readonly charge_type: ChargeType;

  // 충전 상태
  @ApiProperty({ description: '충전 상태' })
  @IsEnum({
    type: 'enum',
    enum: ChargeStatus,
    default: ChargeStatus.PENDING,
  })
  readonly charge_status: ChargeStatus;

  // 유저 포인트
  @ApiProperty({ description: '유저의 포인트' })
  @IsNumber()
  readonly user_point: number;

  // 충전 금액
  @ApiProperty({ description: '충전 금액' })
  @IsNumber()
  readonly amount: number;

  // 충전 포인트
  @ApiProperty({ description: '충전 포인트' })
  @IsNumber()
  readonly point: number;

  // 충전 일시
  @ApiProperty({ description: '충전 일시' })
  // @IsDate()
  readonly created_at: string; // Date()
}
