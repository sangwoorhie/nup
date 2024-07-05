import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIP,
  ArrayUnique,
  ArrayNotEmpty,
  IsEnum,
  IsString,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'API Key를 발급받을 IP 주소들',
    type: [String],
    example: '192.168.1.1,192.168.1.2',
  })
  @IsArray()
  @ArrayUnique()
  @IsIP(undefined, { each: true })
  ips: string[];
}

export class UpdateApiKeyDto {
  @ApiProperty({
    description: 'API Key를 발급받을 IP 주소들',
    type: [String],
    example: '192.168.1.1,192.168.1.2',
  })
  @IsArray()
  @ArrayUnique()
  @IsIP(undefined, { each: true })
  ips: string[];
}

export class FindApikeyReqDto {
  @ApiProperty({
    description: '조회 기준 (`이메일` 또는 `이름` 또는 `API-Key`)',
    enum: ['email', 'username', 'apikey'],
  })
  @IsEnum(['email', 'username', 'apikey'])
  criteria: 'email' | 'username' | 'apikey';

  @ApiProperty({ required: false, description: '이메일' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, description: '유저 이름' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ required: false, description: 'API-Key' })
  @IsString()
  @IsOptional()
  apikey?: string;
}
