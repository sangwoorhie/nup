import { Test, TestingModule } from '@nestjs/testing';
import { AiModelsController } from './ai_models.controller';
import { AiModelsService } from './ai_models.service';

describe('AiModelsController', () => {
  let controller: AiModelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiModelsController],
      providers: [AiModelsService],
    }).compile();

    controller = module.get<AiModelsController>(AiModelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
