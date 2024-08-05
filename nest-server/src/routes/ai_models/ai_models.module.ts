import { Module } from '@nestjs/common';
import { AiModelsService } from './ai_models.service';
import { AiModelsController } from './ai_models.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModel } from 'src/entities/ai_model.entity';
import { Image } from 'src/entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiModel, Image])],
  exports: [AiModelsService],
  controllers: [AiModelsController],
  providers: [AiModelsService],
})
export class AiModelsModule {}
