import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNumber,
  IsString,
} from 'class-validator';

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

// 쿠폰 전체 조회 응답 DTO
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

  // @ApiProperty({ required: true })
  // @IsString()
  // readonly username: string;
}

// 쿠폰 상세 조회 응답 DTO
export class FindOneCouponTemplateResDto {
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

  @ApiProperty({ required: true })
  @IsString()
  readonly username: string;
}

// 쿠폰 템플릿 상세조회 응답 DTO
export class FindCouponResDto {
  @ApiProperty({ description: '쿠폰코드' })
  @IsString()
  code: string;

  @ApiProperty({ description: '사용여부' })
  @IsBoolean()
  is_used: boolean;

  @ApiProperty({ description: '사용 일시' })
  @IsDate()
  used_at: string | null;

  @ApiProperty({ description: '쿠폰사용 회원 이름' })
  @IsString()
  username: string | null;

  @ApiProperty({ description: '쿠폰사용 회원 이메일' })
  @IsEmail()
  email: string | null;
}
