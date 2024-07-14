import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

// 개인유저 단일조회 응답 DTO
export class FindIndiUserResDto {
  @ApiProperty({ required: true })
  @IsString()
  readonly id: string;

  @ApiProperty({ required: true })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly username: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly phone: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly emergency_phone: string;

  @ApiProperty({ required: true })
  @IsNumber()
  readonly point: number;

  @ApiProperty({ required: true })
  @IsDate()
  readonly created_at: Date;
}

// 사업자회원 단일조회 응답 DTO
export class FindCorpUserResDto {
  @ApiProperty({ required: true })
  @IsString()
  readonly id: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly corporate_name: string;

  @ApiProperty({ required: true })
  @IsNumber()
  readonly industry_code: number;

  @ApiProperty({ required: true })
  @IsString()
  readonly business_type: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly business_conditions: string;

  @ApiProperty({ required: true })
  @IsNumber()
  readonly business_registration_number: number;

  @ApiProperty({ required: true })
  @IsString()
  readonly business_license: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly address: string;

  @ApiProperty({ required: true })
  @IsBoolean()
  readonly business_license_verified: boolean;

  @ApiProperty({ required: true })
  @IsString()
  readonly username: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly department: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly position: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly email: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly phone: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly emergency_phone: string;

  @ApiProperty({ required: true })
  @IsDate()
  readonly created_at: Date;
}
