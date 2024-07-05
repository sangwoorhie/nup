import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AiModelsService } from './ai_models.service';

@Controller('ai-models')
export class AiModelsController {
  constructor(private readonly aiModelsService: AiModelsService) {}
}
