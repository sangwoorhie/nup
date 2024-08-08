import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  Length,
} from 'class-validator';
import { IsStrongPassword } from 'src/decorators/strong-password.decorator';
import { CorporateType } from 'src/enums/enums';

// 개인 회원가입 요청 DTO
export class IndiSignUpReqDto {
  @ApiProperty({ required: true, description: '이메일' })
  @IsEmail()
  @MaxLength(30)
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ required: true, description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsStrongPassword() // 8-20자, 숫자 한 개, 대문자 한 개, 소문자 한 개, 특수 문자 한 개를 포함
  readonly password: string;

  @ApiProperty({ required: true, description: '비밀번호 확인' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsStrongPassword()
  readonly confirmPassword: string;

  @ApiProperty({ required: true, description: '회원이름' })
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({ required: true, description: '연락처' })
  @IsString()
  @IsNotEmpty()
  readonly phone: string;

  @ApiProperty({ required: false, description: '비상연락처' })
  @IsString()
  @IsOptional()
  readonly emergency_phone?: string;

  @ApiProperty({
    type: 'string',
    required: false,
    description: '프로필 이미지 (base64 encoded)',
  })
  @IsOptional()
  profile_image?: string;
}

// 이미지 업로드 DTO
export class ImageReqDto {
  @ApiProperty({
    type: 'string',
    required: false,
    description: '프로필 이미지 (base64 encoded)',
  })
  @IsOptional()
  profile_image?: string;
}

// 사업자등록증 업로드 DTO
export class BusinessLicenseReqDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: '사업자 등록증 사본 (base64 encoded)',
  })
  // @IsNotEmpty()
  business_license: string;
}

// 사업자 회원가입 요청 DTO
export class CorpSignUpReqDto {
  @ApiProperty({ required: true, description: '사업자 유형' })
  @IsEnum(CorporateType, {
    message: '사업자 유형은 "business" 또는 "organization" 이어야 합니다.',
  })
  readonly corporate_type: CorporateType;

  @ApiProperty({ required: true, description: '이메일' })
  @IsEmail()
  @MaxLength(30)
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ required: true, description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsStrongPassword()
  readonly password: string;

  @ApiProperty({ required: true, description: '비밀번호 확인' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsStrongPassword()
  readonly confirmPassword: string;

  @ApiProperty({ required: true, description: '회원이름' })
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({ required: true, description: '연락처' })
  @IsString()
  @IsNotEmpty()
  readonly phone: string;

  @ApiProperty({ required: false, description: '비상연락처' })
  @IsString()
  @IsOptional()
  readonly emergency_phone?: string;

  @ApiProperty({ required: false, description: '부서 (사업자회원만 해당)' })
  @IsString()
  @IsOptional()
  readonly department?: string;

  @ApiProperty({ required: false, description: '직위 (사업자회원만 해당)' })
  @IsString()
  @IsOptional()
  readonly position?: string;

  @ApiProperty({ required: true, description: '기업 명' })
  @IsString()
  @IsNotEmpty()
  readonly corporate_name: string;

  @ApiProperty({ required: true, description: '업종 명' })
  @IsString()
  @IsNotEmpty()
  readonly business_type: string;

  @ApiProperty({ required: true, description: '업태 명' })
  @IsString()
  @IsNotEmpty()
  readonly business_conditions: string;

  @ApiProperty({ required: true, description: '사업자 등록번호' })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  readonly business_registration_number: number;

  @ApiProperty({ required: true, description: '주소' })
  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @ApiProperty({
    type: 'string',
    required: false,
    description: '프로필 이미지 (base64 encoded)',
  })
  @IsOptional()
  profile_image?: string;

  @ApiProperty({
    type: 'string',
    required: true,
    description: '사업자 등록증 사본 (base64 encoded)',
  })
  // @IsNotEmpty()
  business_license: string;
}

// 로그인 요청 DTO
export class SignInReqDto {
  @ApiProperty({ required: true, description: '이메일' })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ required: true, description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

// API Key 로그인 요청 DTO
export class ApiKeySignInReqDto {
  @ApiProperty({ required: true, description: 'API Key' })
  @IsString()
  @IsNotEmpty()
  readonly apiKey: string;
}

// 비밀번호 재설정 요청 DTO
export class ResetPasswordReqDto {
  @ApiProperty({ required: true, description: '이메일' })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ required: true, description: '회원이름' })
  @IsString()
  @IsNotEmpty()
  readonly username: string;
}

// 회원가입시 이메일로 인증번호 전송 요청 DTO
export class VerifyAuthNumberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  authNumber: string;
}

export class SendAuthNumberDto {
  @IsEmail()
  email: string;
}
