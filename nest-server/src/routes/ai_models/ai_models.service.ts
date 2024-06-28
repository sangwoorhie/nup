import { Injectable } from '@nestjs/common';
import { CreateAiModelDto } from './dto/create-ai_model.dto';
import { UpdateAiModelDto } from './dto/update-ai_model.dto';

@Injectable()
export class AiModelsService {
  create(createAiModelDto: CreateAiModelDto) {
    return 'This action adds a new aiModel';
  }

  findAll() {
    return `This action returns all aiModels`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aiModel`;
  }

  update(id: number, updateAiModelDto: UpdateAiModelDto) {
    return `This action updates a #${id} aiModel`;
  }

  remove(id: number) {
    return `This action removes a #${id} aiModel`;
  }
}
