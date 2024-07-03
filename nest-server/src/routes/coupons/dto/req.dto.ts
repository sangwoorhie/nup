import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CouponCodeReqDto {
  @ApiProperty({ description: '쿠폰 코드' })
  @IsString()
  readonly code: string;
}

export class ApplyCouponReqDto {
  @ApiProperty({ description: '쿠폰 코드' })
  @IsString()
  readonly code: string;
}
