import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeys } from '../../entities/api_key.entity';
import { CreateApiKeyDto } from './dto/req.dto';
import { generateSerialNumberForIPs } from '../../common/api_number_generator';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKeys)
    private readonly apiKeysRepository: Repository<ApiKeys>,
  ) {}

  // 1. API Key 생성
  async createApiKey(createApiKeyDto: CreateApiKeyDto) {
    const { ips } = createApiKeyDto;

    // 중복된 IP 확인
    const existingApiKeys = await this.apiKeysRepository.find();
    const existingIps = existingApiKeys.flatMap((apiKey) =>
      apiKey.ips.split(','),
    );

    if (ips.some((ip) => existingIps.includes(ip))) {
      throw new Error('중복된 IP가 존재합니다.');
    }

    const ipString = ips.join(',');
    const apiKey = new ApiKeys();
    apiKey.api_key = generateSerialNumberForIPs(ipString);
    apiKey.ips = ipString;

    await this.apiKeysRepository.save(apiKey);

    return { api_key: apiKey.api_key, ips: apiKey.ips };
  }

  // 2. API Key 목록조회
  async listApiKeys() {
    return this.apiKeysRepository.find();
  }
}
