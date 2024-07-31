import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsNumber, IsUUID } from 'class-validator';

export class CouponDetailsResDto {
  @ApiProperty({ description: '쿠폰 명' })
  @IsString()
  readonly coupon_name: string;

  @ApiProperty({ description: '쿠폰 코드' })
  @IsString()
  readonly code: string;

  @ApiProperty({ description: '쿠폰 포인트' })
  @IsNumber()
  readonly point: number;

  @ApiProperty({ description: '쿠폰 유효기간' })
  @IsDate()
  readonly expiration_date: Date;

  @ApiProperty({ description: '쿠폰 사용일시', required: false })
  @IsDate()
  readonly used_at?: Date;
}

export class ApplyCouponResDto extends CouponDetailsResDto {}

export class CouponListResDto {
  @ApiProperty({ description: '쿠폰 ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: '쿠폰 명' })
  @IsString()
  readonly coupon_name: string;

  @ApiProperty({ description: '쿠폰 코드' })
  @IsString()
  readonly code: string;

  @ApiProperty({ description: '쿠폰 포인트' })
  @IsNumber()
  readonly point: number;

  @ApiProperty({ description: '쿠폰 사용일시' })
  @IsDate()
  readonly used_at: Date;

  @ApiProperty({ description: '쿠폰 유효기간' })
  @IsDate()
  readonly expiration_date: Date;
}
