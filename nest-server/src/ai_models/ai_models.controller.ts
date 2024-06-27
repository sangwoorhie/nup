import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AiModelsService } from './ai_models.service';
import { CreateAiModelDto } from './dto/create-ai_model.dto';
import { UpdateAiModelDto } from './dto/update-ai_model.dto';

@Controller('ai-models')
export class AiModelsController {
  constructor(private readonly aiModelsService: AiModelsService) {}

  @Post()
  create(@Body() createAiModelDto: CreateAiModelDto) {
    return this.aiModelsService.create(createAiModelDto);
  }

  @Get()
  findAll() {
    return this.aiModelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiModelsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAiModelDto: UpdateAiModelDto) {
    return this.aiModelsService.update(+id, updateAiModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiModelsService.remove(+id);
  }
}
