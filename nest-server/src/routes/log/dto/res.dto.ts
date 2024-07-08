import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';

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

  // @ApiProperty({ description: '유저' })
  // @IsString()
  // readonly user: string;
}
