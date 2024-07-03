import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

// 개인회원 단일조회 요청 DTO
export class FindIndiUserReqDto {
  @ApiProperty({
    description: '조회 기준 (`이메일` 또는 `유저이름`)',
    enum: ['email', 'username'],
  })
  @IsEnum(['email', 'username'])
  @Transform(({ value }) => value ?? 'email')
  readonly criteria: 'email' | 'username';

  @ApiProperty({ required: false, description: '유저 이메일' })
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @ApiProperty({ required: false, description: '유저 이름' })
  @IsString()
  @IsOptional()
  readonly username?: string;
}

// 사업자회원 단일조회 요청 DTO
export class FindCorpUserReqDto {
  @ApiProperty({
    description: '조회 기준 (`기업명` 또는 `사업자등록번호`)',
    enum: ['corporate_name', 'business_registration_number'],
  })
  @IsEnum(['corporate_name', 'business_registration_number'])
  @Transform(({ value }) => value ?? 'corporate_name')
  readonly criteria: 'corporate_name' | 'business_registration_number';

  @ApiProperty({ required: false, description: '기업명' })
  @IsString()
  @IsOptional()
  readonly corporate_name?: string;

  @ApiProperty({ required: false, description: '사업자등록번호' })
  @IsNumber()
  @IsOptional()
  readonly business_registration_number?: number;
}

// 개인회원 정보수정 요청 DTO
export class UpdateIndiUserReqDto {
  @ApiProperty({ required: false, description: '회원이름' })
  @IsString()
  @IsOptional()
  readonly username?: string;

  @ApiProperty({ required: false, description: '연락처' })
  @IsNumber()
  @IsOptional()
  readonly phone?: number;

  @ApiProperty({ required: false, description: '비상연락처' })
  @IsNumber()
  @IsOptional()
  readonly emergency_phone?: number;

  @ApiProperty({ required: false, description: '프로필 이미지' })
  @IsString()
  @IsOptional()
  readonly profile_image?: string;
}

// 사업자회원 정보수정 요청 DTO
export class UpdateCorpUserReqDto {
  @ApiProperty({ required: false, description: '회원이름' })
  @IsString()
  @IsOptional()
  readonly username?: string;

  @ApiProperty({ required: false, description: '연락처' })
  @IsNumber()
  @IsOptional()
  readonly phone?: number;

  @ApiProperty({ required: false, description: '비상연락처' })
  @IsNumber()
  @IsOptional()
  readonly emergency_phone?: number;

  @ApiProperty({ required: false, description: '프로필 이미지' })
  @IsString()
  @IsOptional()
  readonly profile_image?: string;

  @ApiProperty({ required: false, description: '부서' })
  @IsString()
  @IsOptional()
  readonly department?: string;

  @ApiProperty({ required: false, description: '직위' })
  @IsString()
  @IsOptional()
  readonly position?: string;

  @ApiProperty({ required: false, description: '기업명' })
  @IsString()
  @IsOptional()
  readonly corporate_name?: string;

  @ApiProperty({ required: false, description: '업종 코드' })
  @IsNumber()
  @IsOptional()
  readonly industry_code?: number;

  @ApiProperty({ required: false, description: '업종 명' })
  @IsString()
  @IsOptional()
  readonly business_type?: string;

  @ApiProperty({ required: false, description: '업태 명' })
  @IsString()
  @IsOptional()
  readonly business_conditions?: string;

  @ApiProperty({ required: false, description: '사업자 등록번호' })
  @IsNumber()
  @IsOptional()
  readonly business_registration_number?: number;

  @ApiProperty({ required: false, description: '사업자 등록증 사본' })
  @IsString()
  @IsOptional()
  readonly business_license?: string;

  @ApiProperty({ required: false, description: '주소' })
  @IsString()
  @IsOptional()
  readonly address?: string;
}

// 비밀번호 변경 요청 DTO
export class ChangePasswordReqDto {
  @ApiProperty({ required: true, description: '현재 비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsStrongPassword()
  readonly currentPassword: string;

  @ApiProperty({ required: true, description: '새 비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsStrongPassword()
  readonly newPassword: string;

  @ApiProperty({ required: true, description: '새 비밀번호 확인' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsStrongPassword()
  readonly newPasswordConfirm: string;
}

// 회원탈퇴 요청 DTO
export class DeleteUserReqDto {
  @ApiProperty({ required: true, description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsStrongPassword()
  readonly password: string;
}

// 회원 계정정지 요청 DTO
export class BanUserReqDto {
  @ApiProperty({ required: true, description: '계정정지 사유' })
  @IsString()
  @IsNotEmpty()
  readonly reason: string;
}

// 포인트 충전/차감 요청 DTO
export class UpdatePointsReqDto {
  @ApiProperty({
    required: true,
    description: '포인트 값 (양수: 충전, 음수: 차감)',
  })
  @IsNumber()
  readonly points: number;
}
