import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsStrongPassword } from 'src/decorators/strong-password.decorator';

// 개인회원 단일조회 요청 DTO
export class FindIndiUserReqDto {
  @ApiProperty({
    description: '조회 기준 (`이메일` 또는 `유저이름`)',
    enum: ['email', 'username'],
  })
  @IsEnum(['email', 'username'])
  @IsNotEmpty()
  criteria: 'email' | 'username';

  @ApiProperty({ required: false, description: '유저 이메일' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, description: '유저 이름' })
  @IsString()
  @IsOptional()
  username?: string;
}

// 사업자회원 단일조회 요청 DTO
export class FindCorpUserReqDto {
  @ApiProperty({
    description: '조회 기준 (`기업명` 또는 `사업자등록번호`)',
    enum: ['corporate_name', 'business_registration_number'],
  })
  @IsEnum(['corporate_name', 'business_registration_number'])
  @IsNotEmpty()
  criteria: 'corporate_name' | 'business_registration_number';

  @ApiProperty({ required: false, description: '기업명' })
  @IsString()
  @IsOptional()
  corporate_name?: string;

  @ApiProperty({ required: false, description: '사업자등록번호' })
  @IsNumber()
  @IsOptional()
  business_registration_number?: number;
}

// 개인회원 정보수정 요청 DTO
export class UpdateIndiUserReqDto {
  @ApiProperty({ required: false, description: '회원이름' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ required: false, description: '연락처' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: false, description: '비상연락처' })
  @IsString()
  @IsOptional()
  emergency_phone?: string;

  @ApiProperty({ required: false, description: '프로필 이미지' })
  @IsString()
  @IsOptional()
  profile_image?: string;
}

// 사업자회원 정보수정 요청 DTO
export class UpdateCorpUserReqDto {
  @ApiProperty({ required: false, description: '회원이름' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ required: false, description: '연락처' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: false, description: '비상연락처' })
  @IsString()
  @IsOptional()
  emergency_phone?: string;

  @ApiProperty({ required: false, description: '프로필 이미지' })
  @IsString()
  @IsOptional()
  profile_image?: string;

  @ApiProperty({ required: false, description: '부서' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ required: false, description: '직위' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({ required: false, description: '기업명' })
  @IsString()
  @IsNotEmpty()
  corporate_name: string;

  @ApiProperty({ required: false, description: '업종 명' })
  @IsString()
  @IsNotEmpty()
  business_type: string;

  @ApiProperty({ required: false, description: '업태 명' })
  @IsString()
  @IsNotEmpty()
  business_conditions: string;

  @ApiProperty({ required: false, description: '사업자 등록번호' })
  @IsNumber()
  @IsNotEmpty()
  business_registration_number: number;

  @ApiProperty({ required: false, description: '사업자 등록증 사본' })
  @IsString()
  @IsNotEmpty()
  business_license: string;

  @ApiProperty({ required: false, description: '주소' })
  @IsString()
  @IsNotEmpty()
  address: string;
}

// 비밀번호 변경 요청 DTO
export class ChangePasswordReqDto {
  @ApiProperty({ required: true, description: '새 비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsStrongPassword()
  newPassword: string;

  @ApiProperty({ required: true, description: '새 비밀번호 확인' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsStrongPassword()
  newPasswordConfirm: string;
}

// 회원탈퇴 요청 DTO
export class DeleteUserReqDto {
  @ApiProperty({ required: true, description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

// 회원 계정정지 요청 DTO
export class BanUserReqDto {
  @ApiProperty({ required: true, description: '계정정지 사유' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

// 포인트 충전/차감 요청 DTO
export class UpdatePointsReqDto {
  @ApiProperty({
    required: true,
    description: '포인트 값 (양수: 충전, 음수: 차감)',
  })
  @IsNumber()
  points: number;
}

// 이메일 중복검사 요청 DTO
export class CheckEmailReqDto {
  @ApiProperty({ required: true, description: '이메일 중복확인' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

// 비밀번호로 본인확인 검사 DTO
export class CheckPasswordReqDto {
  @ApiProperty({ required: true, description: '비밀번호로 본인확인 검사' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

// 유저 현금충전 요청 금액 DTO
export class ChargeAmountReqDto {
  @ApiProperty({ required: true, description: '유저 현금충전 요청 금액' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

// 관리자회원 단일조회 요청 DTO
export class FindAdminUserReqDto {
  @ApiProperty({
    description: '조회 기준 (`이메일` 또는 `유저이름`)',
    enum: ['email', 'username'],
  })
  @IsEnum(['email', 'username'])
  @IsNotEmpty()
  criteria: 'email' | 'username';

  @ApiProperty({ required: false, description: '유저 이메일' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, description: '유저 이름' })
  @IsString()
  @IsOptional()
  username?: string;
}
