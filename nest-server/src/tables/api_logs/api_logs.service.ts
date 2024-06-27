import { Injectable } from '@nestjs/common';
import { CreateApiLogDto } from './dto/create-api_log.dto';
import { UpdateApiLogDto } from './dto/update-api_log.dto';

@Injectable()
export class ApiLogsService {
  create(createApiLogDto: CreateApiLogDto) {
    return 'This action adds a new apiLog';
  }

  findAll() {
    return `This action returns all apiLogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} apiLog`;
  }

  update(id: number, updateApiLogDto: UpdateApiLogDto) {
    return `This action updates a #${id} apiLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} apiLog`;
  }
}
