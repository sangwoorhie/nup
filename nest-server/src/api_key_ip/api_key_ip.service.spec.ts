import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyIpService } from './api_key_ip.service';

describe('ApiKeyIpService', () => {
  let service: ApiKeyIpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiKeyIpService],
    }).compile();

    service = module.get<ApiKeyIpService>(ApiKeyIpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
