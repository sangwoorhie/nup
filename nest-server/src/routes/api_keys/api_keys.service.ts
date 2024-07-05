import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeys } from '../../entities/api_key.entity';
import {
  CreateApiKeyDto,
  FindApikeyReqDto,
  UpdateApiKeyDto,
} from './dto/req.dto';
import { ApiLog } from 'src/entities/api_log.entity';
import * as moment from 'moment';
import { User } from 'src/entities/user.entity';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKeys)
    private readonly apiKeysRepository: Repository<ApiKeys>,
    @InjectRepository(ApiLog)
    private readonly apiLogRepository: Repository<ApiLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    return Math.random().toString(36).slice(2, 13);
  }

  // 2. API Key 목록조회
  async listApiKeys(userId: string, page: number, size: number) {
    const [apiKeys, total] = await this.apiKeysRepository.findAndCount({
      relations: ['api_logs'],
      where: { user: { id: userId } },
      skip: (page - 1) * size,
      take: size,
    });

    const today = moment().startOf('day').toDate();

    const items = await Promise.all(
      apiKeys.map(async (apiKey) => {
        const todayUsageResult = await this.apiLogRepository
          .createQueryBuilder('api_log')
          .select('SUM(api_log.tokens_used)', 'sum')
          .where('api_log.api_keys_id = :apiKeyId', { apiKeyId: apiKey.id })
          .andWhere('api_log.created_at >= :today', { today })
          .getRawOne();

        const totalUsageResult = await this.apiLogRepository
          .createQueryBuilder('api_log')
          .select('SUM(api_log.tokens_used)', 'sum')
          .where('api_log.api_keys_id = :apiKeyId', { apiKeyId: apiKey.id })
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

  //  API Key 목록조회 (User정보가 제외됨)
  // async listApiKeys(page: number, size: number) {
  //   const [apiKeys, total] = await this.apiKeysRepository.findAndCount({
  //     relations: ['api_logs'],
  //     skip: (page - 1) * size,
  //     take: size,
  //   });

  //   const today = moment().startOf('day').toDate();

  //   const items = await Promise.all(
  //     apiKeys.map(async (apiKey) => {
  //       const todayUsageResult = await this.apiLogRepository
  //         .createQueryBuilder('api_log')
  //         .select('SUM(api_log.tokens_used)', 'sum')
  //         .where('api_log.api_keys_id = :apiKeyId', { apiKeyId: apiKey.id })
  //         .andWhere('api_log.created_at >= :today', { today })
  //         .getRawOne();

  //       const totalUsageResult = await this.apiLogRepository
  //         .createQueryBuilder('api_log')
  //         .select('SUM(api_log.tokens_used)', 'sum')
  //         .where('api_log.api_keys_id = :apiKeyId', { apiKeyId: apiKey.id })
  //         .getRawOne();

  //       const todayUsage = todayUsageResult.sum || 0;
  //       const totalUsage = totalUsageResult.sum || 0;

  //       return {
  //         api_key: apiKey.api_key,
  //         ips: apiKey.ips.split(','),
  //         today_usage: parseInt(todayUsage, 10),
  //         total_usage: parseInt(totalUsage, 10),
  //         created_at: apiKey.created_at,
  //       };
  //     }),
  //   );

  //   return {
  //     page,
  //     size,
  //     total,
  //     items,
  //   };
  // }

  // 3. API Key 활성/정지
  async apiKeyStatus(userId: string, id: string) {
    const apiKey = await this.apiKeysRepository.findOne({
      where: {
        id,
        user: { id: userId },
      },
      relations: ['user'],
    });

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
  async updateApiKeyIps(
    userId: string,
    id: string,
    updateApiKeyDto: UpdateApiKeyDto,
  ) {
    const apiKey = await this.apiKeysRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!apiKey) {
      throw new NotFoundException('API Key를 찾을 수 없습니다.');
    }

    const { ips } = updateApiKeyDto;
    const ipString = ips.join(',');
    apiKey.ips = ipString;

    await this.apiKeysRepository.save(apiKey);

    return { api_key: apiKey.api_key, ips: apiKey.ips.split(',') };
  }

  // 5. API Key 전체목록 조회 (관리자)
  async listApiKeysAdmin(page: number, size: number) {
    const [apiKeys, total] = await this.apiKeysRepository.findAndCount({
      relations: ['user', 'api_logs'],
      skip: (page - 1) * size,
      take: size,
    });

    const today = moment().startOf('day').toDate();

    const items = await Promise.all(
      apiKeys.map(async (apiKey) => {
        const todayUsageResult = await this.apiLogRepository
          .createQueryBuilder('api_log')
          .select('SUM(api_log.tokens_used)', 'sum')
          .where('api_log.api_keys_id = :apiKeyId', { apiKeyId: apiKey.id })
          .andWhere('api_log.created_at >= :today', { today })
          .getRawOne();

        const totalUsageResult = await this.apiLogRepository
          .createQueryBuilder('api_log')
          .select('SUM(api_log.tokens_used)', 'sum')
          .where('api_log.api_keys_id = :apiKeyId', { apiKeyId: apiKey.id })
          .getRawOne();

        const todayUsage = todayUsageResult.sum || 0;
        const totalUsage = totalUsageResult.sum || 0;

        return {
          api_key: apiKey.api_key,
          ips: apiKey.ips.split(','),
          today_usage: parseInt(todayUsage, 10),
          total_usage: parseInt(totalUsage, 10),
          created_at: apiKey.created_at,
          username: apiKey.user ? apiKey.user.username : '',
          email: apiKey.user ? apiKey.user.email : '',
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

  // 6. API Key 입력조회 (Email or 이름 or ApiKey) (관리자)
  async searchApiKeysAdmin(findApikeyReqDto: FindApikeyReqDto) {
    let apiKeys: ApiKeys[];

    const { criteria, email, username, apikey } = findApikeyReqDto;

    switch (criteria) {
      case 'email':
        apiKeys = await this.apiKeysRepository
          .createQueryBuilder('api_keys')
          .leftJoinAndSelect('api_keys.user', 'user')
          .where('user.email = :value', { email })
          .getMany();
        break;
      case 'username':
        apiKeys = await this.apiKeysRepository
          .createQueryBuilder('api_keys')
          .leftJoinAndSelect('api_keys.user', 'user')
          .where('user.username = :value', { username })
          .getMany();
        break;
      case 'apikey':
        apiKeys = await this.apiKeysRepository
          .createQueryBuilder('api_keys')
          .leftJoinAndSelect('api_keys.user', 'user')
          .where('api_keys.api_key = :value', { apikey })
          .getMany();
        break;
    }

    return apiKeys.map((apiKey) => ({
      api_key: apiKey.api_key,
      ips: apiKey.ips.split(','),
      created_at: apiKey.created_at,
      username: apiKey.user.username,
      email: apiKey.user.email,
    }));
  }

  // 7. API Key 활성/비활성 기능 (관리자)
  async apiKeyStatusAdmin(id: string) {
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

  // 8. API Key 재발급 기능 (관리자)
  async regenerateApiKeyAdmin(id: string) {
    const apiKey = await this.apiKeysRepository.findOne({ where: { id } });
    if (!apiKey) {
      throw new NotFoundException('API Key를 찾을 수 없습니다.');
    }

    apiKey.api_key = this.generateSerialNumberForIPs();
    await this.apiKeysRepository.save(apiKey);

    return { api_key: apiKey.api_key, message: 'API Key가 재발급되었습니다.' };
  }
}
