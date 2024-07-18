import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeys } from '../../entities/api_key.entity';
import {
  CreateApiKeyReqDto,
  SearchApikeyReqDto,
  UpdateApiKeyReqDto,
} from './dto/req.dto';
import * as moment from 'moment';
import { User } from 'src/entities/user.entity';
import { PageResDto } from 'src/common/dto/res.dto';
import { FindApikeyAdminResDto } from './dto/res.dto';
import { UserType } from 'src/enums/enums';
import { TokenUsage } from 'src/entities/token_usage.entity';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKeys)
    private readonly apiKeysRepository: Repository<ApiKeys>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TokenUsage)
    private readonly tokenUsageRepository: Repository<TokenUsage>,
  ) {}

  // 1. API Key 생성 (사용자)
  async createApiKey(userId: string, createApiKeyReqDto: CreateApiKeyReqDto) {
    const { ips } = createApiKeyReqDto;

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

    // 사용자 정보 가져오기
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    apiKey.user = user;

    // API Key 저장
    await this.apiKeysRepository.save(apiKey);

    return { api_key: apiKey.api_key, ips: apiKey.ips };
  }

  private generateSerialNumberForIPs(): string {
    return Math.random().toString(36).slice(2, 13);
  }

  // 2. API Key 목록조회 (사용자)
  async listApiKeys(userId: string, page: number, size: number) {
    const [apiKeys, total] = await this.apiKeysRepository.findAndCount({
      where: { user: { id: userId } },
      skip: (page - 1) * size,
      take: size,
      order: { created_at: 'DESC' }, // Order by created_at in descending order
    });

    const today = moment().startOf('day').toDate();

    const todayUsageResult = await this.tokenUsageRepository
      .createQueryBuilder('token_usage')
      .select('SUM(token_usage.count)', 'sum')
      .where('token_usage.userId = :userId', { userId })
      .andWhere('token_usage.date >= :today', { today })
      .getRawOne();

    const totalUsageResult = await this.tokenUsageRepository
      .createQueryBuilder('token_usage')
      .select('SUM(token_usage.count)', 'sum')
      .where('token_usage.userId = :userId', { userId })
      .getRawOne();

    const todayUsage = todayUsageResult.sum || 0;
    const totalUsage = totalUsageResult.sum || 0;

    const items = apiKeys.map((apiKey) => ({
      api_key: apiKey.api_key,
      ips: apiKey.ips.split(','),
      today_usage: parseInt(todayUsage, 10),
      total_usage: parseInt(totalUsage, 10),
      created_at: apiKey.created_at,
      is_active: apiKey.is_active,
    }));

    return {
      page,
      size,
      total,
      items,
    };
  }

  // 3. API Key 활성/정지 (사용자)
  async apiKeyStatus(userId: string, apiKey: string) {
    const apiKeyEntity = await this.apiKeysRepository.findOne({
      where: {
        api_key: apiKey,
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (!apiKeyEntity) {
      throw new NotFoundException('API Key를 찾을 수 없습니다.');
    }

    apiKeyEntity.is_active = !apiKeyEntity.is_active;
    await this.apiKeysRepository.save(apiKeyEntity);
    const message = apiKeyEntity.is_active
      ? 'API-Key가 활성화되었습니다.'
      : 'API-Key가 정지되었습니다.';
    return {
      api_key: apiKeyEntity.api_key,
      is_active: apiKeyEntity.is_active,
      message,
    };
  }

  // 4. IP 주소 수정 (사용자)
  async updateApiKeyIps(
    userId: string,
    apiKey: string,
    updateApiKeyReqDto: UpdateApiKeyReqDto,
  ) {
    const apiKeyEntity = await this.apiKeysRepository.findOne({
      where: { api_key: apiKey, user: { id: userId } },
      relations: ['user'],
    });

    if (!apiKeyEntity) {
      throw new NotFoundException('API Key를 찾을 수 없습니다.');
    }

    const { ips } = updateApiKeyReqDto;
    const ipString = ips.join(',');
    apiKeyEntity.ips = ipString;

    await this.apiKeysRepository.save(apiKeyEntity);

    return { api_key: apiKeyEntity.api_key, ips: apiKeyEntity.ips.split(',') };
  }

  // 5. API Key 전체목록 조회 (관리자)
  async listApiKeysAdmin(page: number, size: number) {
    const [apiKeys, total] = await this.apiKeysRepository.findAndCount({
      relations: ['user', 'user.corporate'],
      skip: (page - 1) * size,
      take: size,
    });

    const items = await Promise.all(
      apiKeys.map(async (apiKey) => {
        if (!apiKey.user) {
          return {
            api_key: apiKey.api_key,
            ips: apiKey.ips.split(','),
            today_usage: '0',
            total_usage: '0',
            created_at: apiKey.created_at,
            username: '',
            email: '',
          };
        }

        const today = moment().startOf('day').toDate();

        const todayUsageResult = await this.tokenUsageRepository
          .createQueryBuilder('token_usage')
          .select('SUM(token_usage.count)', 'sum')
          .where('token_usage.userId = :userId', { userId: apiKey.user.id })
          .andWhere('token_usage.date >= :today', { today })
          .getRawOne();

        const totalUsageResult = await this.tokenUsageRepository
          .createQueryBuilder('token_usage')
          .select('SUM(token_usage.count)', 'sum')
          .where('token_usage.userId = :userId', { userId: apiKey.user.id })
          .getRawOne();

        const todayUsage = todayUsageResult.sum || 0;
        const totalUsage = totalUsageResult.sum || 0;

        let usernameOrCorporateName = '';
        if (apiKey.user) {
          usernameOrCorporateName =
            apiKey.user.user_type === UserType.CORPORATE
              ? apiKey.user.corporate?.corporate_name || ''
              : apiKey.user.username;
        }

        return {
          api_key: apiKey.api_key,
          ips: apiKey.ips.split(','),
          today_usage: todayUsage.toString(),
          total_usage: totalUsage.toString(),
          created_at: apiKey.created_at,
          username: usernameOrCorporateName,
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
  async searchApiKeysAdmin(
    searchApikeyReqDto: SearchApikeyReqDto,
    page: number,
    size: number,
  ) {
    let whereCondition: any = {};

    const { criteria, email, username, apikey } = searchApikeyReqDto;

    switch (criteria) {
      case 'email':
        whereCondition = { user: { email } };
        break;
      case 'username':
        whereCondition = { user: { username } };
        break;
      case 'apikey':
        whereCondition = { api_key: apikey };
        break;
      default:
        throw new BadRequestException('Invalid criteria');
    }

    const [apiKeys, total] = await this.apiKeysRepository.findAndCount({
      where: whereCondition,
      relations: ['user', 'user.corporate'],
      skip: (page - 1) * size,
      take: size,
    });

    const items = await Promise.all(
      apiKeys.map(async (apiKey) => {
        const today = moment().startOf('day').toDate();

        const todayUsageResult = await this.tokenUsageRepository
          .createQueryBuilder('token_usage')
          .select('SUM(token_usage.count)', 'sum')
          .where('token_usage.userId = :userId', { userId: apiKey.user.id })
          .andWhere('token_usage.date >= :today', { today })
          .getRawOne();

        const totalUsageResult = await this.tokenUsageRepository
          .createQueryBuilder('token_usage')
          .select('SUM(token_usage.count)', 'sum')
          .where('token_usage.userId = :userId', { userId: apiKey.user.id })
          .getRawOne();

        const todayUsage = todayUsageResult.sum || 0;
        const totalUsage = totalUsageResult.sum || 0;

        const usernameOrCorporateName =
          apiKey.user.user_type === UserType.CORPORATE
            ? apiKey.user.corporate.corporate_name
            : apiKey.user.username;

        return {
          api_key: apiKey.api_key,
          ips: apiKey.ips.split(','),
          today_usage: todayUsage.toString(),
          total_usage: totalUsage.toString(),
          created_at: apiKey.created_at,
          username: usernameOrCorporateName,
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
