import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

// 단일유저 조회 요청 DTO
export class FindUserReqDto {
  @ApiProperty({ required: true, description: '유저 아이디' })
  @IsUUID()
  readonly id: string;
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

// 비밀번호 변경 DTO
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

// 회원탈퇴 DTO
export class DeleteUserReqDto {
  @ApiProperty({ required: true, description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsStrongPassword()
  readonly password: string;
}
