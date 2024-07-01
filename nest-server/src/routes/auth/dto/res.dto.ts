import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

// 개인 회원가입 응답 DTO
export class IndiSignUpResDto {
  @ApiProperty({ required: true })
  @IsString()
  readonly id: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly accessToken: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly refreshToken: string;
}

// 사업자 회원가입 응답 DTO
export class CorpSignUpResDto {
  @ApiProperty({ required: true })
  @IsString()
  readonly id: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly accessToken: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly refreshToken: string;
}

// 로그인 응답 DTO
export class SigninResDto {
  @ApiProperty({ required: true })
  @IsString()
  readonly accessToken: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly refreshToken: string;
}

// 리프레시토큰 응답 DTO
export class RefreshResDto {
  @ApiProperty({ required: true })
  @IsString()
  readonly accessToken: string;

  @ApiProperty({ required: true })
  @IsString()
  readonly refreshToken: string;
}
