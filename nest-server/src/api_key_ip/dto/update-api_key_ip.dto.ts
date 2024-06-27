import { PartialType } from '@nestjs/mapped-types';
import { CreateApiKeyIpDto } from './create-api_key_ip.dto';

export class UpdateApiKeyIpDto extends PartialType(CreateApiKeyIpDto) {}
