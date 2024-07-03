import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

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
