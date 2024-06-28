import { Module } from '@nestjs/common';
import { AiModelsService } from './ai_models.service';
import { AiModelsController } from './ai_models.controller';

@Module({
  controllers: [AiModelsController],
  providers: [AiModelsService],
})
export class AiModelsModule {}
