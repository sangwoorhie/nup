import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

// 개인 회원가입 응답 DTO
export class IndividualSignUpResDto {
  @ApiProperty({ required: true })
  @IsString()
  readonly id: string;
}

// 사업자 회원가입 응답 DTO
export class CorporateSignUpResDto {
  @ApiProperty({ required: true })
  @IsString()
  readonly id: string;
}

// 로그인 응답 DTO
export class SigninResDto {
  @ApiProperty({ required: true })
  readonly accessToken: string;
}
