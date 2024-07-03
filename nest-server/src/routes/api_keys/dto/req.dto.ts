import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIP, ArrayUnique, ArrayNotEmpty } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'API Key를 발급받을 IP 주소들', type: [String] })
  @IsArray()
  @ArrayUnique()
  @ArrayNotEmpty()
  @IsIP(undefined, { each: true })
  ips: string[];
}
