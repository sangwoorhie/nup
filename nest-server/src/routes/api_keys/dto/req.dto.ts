import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIP, ArrayUnique, ArrayNotEmpty } from 'class-validator';

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
