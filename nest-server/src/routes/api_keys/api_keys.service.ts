import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeys } from '../../entities/api_key.entity';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/req.dto';
import { ApiLog } from 'src/entities/api_log.entity';
import * as moment from 'moment';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKeys)
    private readonly apiKeysRepository: Repository<ApiKeys>,
    @InjectRepository(ApiLog)
    private readonly apiLogRepository: Repository<ApiLog>,
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
    apiKey.api_key = this.generateSerialNumberForIPs();
    apiKey.ips = ipString;

    await this.apiKeysRepository.save(apiKey);

    return { api_key: apiKey.api_key, ips: apiKey.ips };
  }

  private generateSerialNumberForIPs(): string {
    return Math.random().toString(36).slice(2);
  }

  // 2. API Key 목록조회
  async listApiKeys(page: number, size: number) {
    const [apiKeys, total] = await this.apiKeysRepository.findAndCount({
      relations: ['api_logs'],
      skip: (page - 1) * size,
      take: size,
    });

    const today = moment().startOf('day').toDate();

    const items = await Promise.all(
      apiKeys.map(async (apiKey) => {
        const todayUsageResult = await this.apiLogRepository
          .createQueryBuilder('api_log')
          .select('SUM(api_log.tokens_used)', 'sum')
          .where('api_log.api_keysId = :apiKeyId', { apiKeyId: apiKey.id })
          .andWhere('api_log.created_at >= :today', { today })
          .getRawOne();

        const totalUsageResult = await this.apiLogRepository
          .createQueryBuilder('api_log')
          .select('SUM(api_log.tokens_used)', 'sum')
          .where('api_log.api_keysId = :apiKeyId', { apiKeyId: apiKey.id })
          .getRawOne();

        const todayUsage = todayUsageResult.sum || 0;
        const totalUsage = totalUsageResult.sum || 0;

        return {
          api_key: apiKey.api_key,
          ips: apiKey.ips.split(','),
          today_usage: parseInt(todayUsage, 10),
          total_usage: parseInt(totalUsage, 10),
          created_at: apiKey.created_at,
        };
      }),
    );

    return {
      page,
      size,
      total,
      items,
    };
  }

  // 3. API Key 활성/정지
  async apiKeyStatus(id: string) {
    const apiKey = await this.apiKeysRepository.findOne({ where: { id } });
    if (!apiKey) {
      throw new NotFoundException('API Key를 찾을 수 없습니다.');
    }
    apiKey.is_active = !apiKey.is_active;
    await this.apiKeysRepository.save(apiKey);
    const message = apiKey.is_active
      ? 'API-Key가 활성화되었습니다.'
      : 'API-Key가 정지되었습니다.';
    return { api_key: apiKey.api_key, is_active: apiKey.is_active, message };
  }

  // 4. IP 주소 수정
  async updateApiKeyIps(id: string, updateApiKeyDto: UpdateApiKeyDto) {
    const apiKey = await this.apiKeysRepository.findOne({ where: { id } });
    if (!apiKey) {
      throw new NotFoundException('API Key를 찾을 수 없습니다.');
    }

    const { ips } = updateApiKeyDto;
    const ipString = ips.join(',');
    apiKey.ips = ipString;

    await this.apiKeysRepository.save(apiKey);

    return { api_key: apiKey.api_key, ips: apiKey.ips.split(',') };
  }
}
