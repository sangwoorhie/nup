import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

export class LogResDto {
  @ApiProperty({ description: '유저 접속일시' })
  @IsDate()
  readonly loginTimestamp: Date;

  @ApiProperty({ description: 'IP 주소' })
  @IsString()
  readonly ip: string;

  @ApiProperty({ description: '유저 에이전트' })
  @IsString()
  readonly userAgent: string;

  @ApiProperty({ description: '회원 E-mail' })
  @IsEmail()
  readonly userEmail: string;

  @ApiProperty({ description: '회원 유형' })
  @IsString()
  readonly userType: string;
}
