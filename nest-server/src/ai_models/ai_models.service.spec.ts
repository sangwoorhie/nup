import { Test, TestingModule } from '@nestjs/testing';
import { AiModelsService } from './ai_models.service';

describe('AiModelsService', () => {
  let service: AiModelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiModelsService],
    }).compile();

    service = module.get<AiModelsService>(AiModelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
