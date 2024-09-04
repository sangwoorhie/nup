import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageResDto } from 'src/common/dto/res.dto';
import { Log } from 'src/entities/log.entity';
import { Repository } from 'typeorm';
import { LogResDto } from './dto/res.dto';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  // 1. 모든 로그 조회 (관리자)
  async findAllLogs(
    page: number,
    size: number,
  ): Promise<PageResDto<LogResDto>> {
    const [logs, total] = await this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .select([
        'log.id',
        'log.loginTimestamp',
        'log.ip',
        'log.userAgent',
        'user.email',
        'user.user_type',
      ])
      .skip((page - 1) * size)
      .take(size)
      .orderBy('log.loginTimestamp', 'DESC')
      .getManyAndCount();

    return {
      page,
      size,
      total,
      items: logs.map((log) => ({
        loginTimestamp: log.loginTimestamp,
        ip: log.ip,
        userAgent: log.userAgent,
        userEmail: log.user?.email ?? null, // Safe navigation in case user is null
        userType: log.user.user_type,
      })),
    };
  }
}
