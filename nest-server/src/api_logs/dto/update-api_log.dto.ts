import { PartialType } from '@nestjs/mapped-types';
import { CreateApiLogDto } from './create-api_log.dto';

export class UpdateApiLogDto extends PartialType(CreateApiLogDto) {}
