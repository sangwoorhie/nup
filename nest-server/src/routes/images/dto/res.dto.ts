import { PartialType } from '@nestjs/mapped-types';
import { CreateImageDto } from './req.dto';

export class UpdateImageDto extends PartialType(CreateImageDto) {}
