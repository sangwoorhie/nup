import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyIpController } from './api_key_ip.controller';
import { ApiKeyIpService } from './api_key_ip.service';

describe('ApiKeyIpController', () => {
  let controller: ApiKeyIpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeyIpController],
      providers: [ApiKeyIpService],
    }).compile();

    controller = module.get<ApiKeyIpController>(ApiKeyIpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
