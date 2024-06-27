import { Injectable } from '@nestjs/common';
import { CreateApiKeyIpDto } from './dto/create-api_key_ip.dto';
import { UpdateApiKeyIpDto } from './dto/update-api_key_ip.dto';

@Injectable()
export class ApiKeyIpService {
  create(createApiKeyIpDto: CreateApiKeyIpDto) {
    return 'This action adds a new apiKeyIp';
  }

  findAll() {
    return `This action returns all apiKeyIp`;
  }

  findOne(id: number) {
    return `This action returns a #${id} apiKeyIp`;
  }

  update(id: number, updateApiKeyIpDto: UpdateApiKeyIpDto) {
    return `This action updates a #${id} apiKeyIp`;
  }

  remove(id: number) {
    return `This action removes a #${id} apiKeyIp`;
  }
}
