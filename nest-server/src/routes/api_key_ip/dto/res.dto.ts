import { PartialType } from '@nestjs/mapped-types';
import { CreateApiKeyIpDto } from './req.dto';

export class UpdateApiKeyIpDto extends PartialType(CreateApiKeyIpDto) {}
