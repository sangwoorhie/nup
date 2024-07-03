import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiKeysService } from './api_keys.service';
import { CreateApiKeyDto } from './dto/req.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('API Key')
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  // 1. API Key 생성
  @Post('create')
  @ApiOperation({ summary: 'API Key 생성' })
  @ApiResponse({ status: 201, description: 'API Key가 생성되었습니다.' })
  async createApiKey(@Body() createApiKeyDto: CreateApiKeyDto) {
    return this.apiKeysService.createApiKey(createApiKeyDto);
  }

  // 2. API Key 목록조회
  @Get('list')
  @ApiOperation({ summary: 'API Key 목록 조회' })
  @ApiResponse({ status: 200, description: 'API Key 목록을 반환합니다.' })
  async listApiKeys() {
    return this.apiKeysService.listApiKeys();
  }
}
