import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

// 쿠폰 생성 요청 DTO
export class CreateCouponReqDto {
  @ApiProperty({ description: '쿠폰 명' })
  @IsString()
  readonly coupon_name: string;

  @ApiProperty({ description: '쿠폰 발행수량' })
  @IsNumber()
  readonly quantity: number;

  @ApiProperty({ description: '쿠폰 포인트' })
  @IsNumber()
  readonly point: number;

  @ApiProperty({ description: '쿠폰 만료시각(유효일자)' })
  @IsDate()
  readonly expiration_date: Date;
}

// 쿠폰 수정 요청 DTO
export class UpdateCouponReqDto {
  @ApiProperty({ description: '쿠폰 발행수량' })
  @IsNumber()
  readonly quantity: number;
}

// 쿠폰 발급일 기준 조회 DTO
export class DateReqDto {
  @ApiProperty({ description: '쿠폰 발급 시작일' })
  @IsDate()
  readonly start_date: Date;

  @ApiProperty({ description: '쿠폰 발급 마감일' })
  @IsDate()
  readonly end_date: Date;
}

// 쿠폰명으로 조회 요청 DTO
export class FindByCouponNameReqDto {
  @ApiProperty({ description: '쿠폰 명' })
  @IsString()
  readonly coupon_name: string;
}

// 쿠폰 템플릿 목록조회 요청 DTO
export class FindCouponTemplateReqDto {
  @ApiProperty({
    description:
      '조회 기준 (`전체조회` 또는 `유효쿠폰만 조회` 또는 `만료쿠폰만 조회`)',
    enum: ['all', 'non-expired', 'expired'],
  })
  @IsEnum(['all', 'non-expired', 'expired'])
  @Transform(({ value }) => value ?? 'all')
  readonly criteria: 'all' | 'non-expired' | 'expired';
}

// 쿠폰 템플릿 상세조회 요청1 DTO
export class FindCouponReqDto1 {
  @ApiProperty({
    description: '조회 기준 (`쿠폰코드` 또는 `유저이름`)',
    enum: ['code', 'username'],
  })
  @IsEnum(['code', 'username'])
  @Transform(({ value }) => value ?? 'code')
  readonly criteria: 'code' | 'username';

  @ApiProperty({ required: false, description: '쿠폰 코드' })
  @IsString()
  @IsOptional()
  readonly code?: string;

  @ApiProperty({ required: false, description: '유저 이름' })
  @IsString()
  @IsOptional()
  readonly username?: string;
}

// 쿠폰 탬플릿 상세조회 요청2 DTO
export class FindCouponReqDto2 {
  @ApiProperty({
    description:
      '조회 기준 (`전체조회` 또는 `사용쿠폰만 조회` 또는 `미사용쿠폰만 조회`)',
    enum: ['all', 'used', 'unused'],
  })
  @IsEnum(['all', 'used', 'unused'])
  @Transform(({ value }) => value ?? 'all')
  readonly criteria: 'all' | 'used' | 'unused';
}
