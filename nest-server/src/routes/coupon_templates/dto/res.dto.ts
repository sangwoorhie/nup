import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

// 쿠폰 생성 응답 DTO
export class CreateCouponResDto {
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

// 쿠폰 조회 응답 DTO
export class FindCouponTemplateResDto {
  @ApiProperty({ required: true })
  @IsString()
  readonly id: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly coupon_name: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly quantity: number;

  @ApiProperty({ required: true })
  @IsNumber()
  readonly point: number;

  @ApiProperty({ required: true })
  @IsDate()
  readonly created_at: Date;

  @ApiProperty({ required: true })
  @IsDate()
  readonly expiration_date: Date;
}
