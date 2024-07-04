import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiKeysService } from './api_keys.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/req.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PageReqDto } from 'src/common/dto/req.dto';

@ApiTags('API Key')
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  // 1. API Key 생성 (사용자)
  // POST : localhost:3000/api-keys/create
  @Post('create')
  @ApiOperation({ summary: 'API Key 생성' })
  @ApiResponse({ status: 201, description: 'API Key가 생성되었습니다.' })
  async createApiKey(@Body() createApiKeyDto: CreateApiKeyDto) {
    return this.apiKeysService.createApiKey(createApiKeyDto);
  }

  // 2. API Key 목록조회 (사용자)
  // GET : localhost:3000/api-keys/list?page=1&size=20
  @Get('list')
  @ApiOperation({ summary: 'API Key 목록 조회' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({ status: 200, description: 'API Key 목록을 반환합니다.' })
  async listApiKeys(@Query() { page, size }: PageReqDto) {
    return this.apiKeysService.listApiKeys(page, size);
  }

  // 3. API Key 활성/정지 (사용자)
  // PATCH : localhost:3000/api-keys/active/:id
  @Patch('active/:id')
  @ApiOperation({ summary: 'API Key 활성/정지' })
  @ApiResponse({
    status: 200,
    description: 'API Key의 활성/정지 상태가 변경되었습니다.',
  })
  async apiKeyStatus(@Param('id') id: string) {
    return this.apiKeysService.apiKeyStatus(id);
  }

  // 4. IP 주소 수정 (사용자)
  // PATCH : localhost:3000/api-keys/update-ips/:id
  @Patch('update-ips/:id')
  @ApiOperation({ summary: 'IP 주소 변경' })
  @ApiResponse({ status: 200, description: 'IP 주소가 변경되었습니다.' })
  async updateApiKeyIps(
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
  ) {
    return this.apiKeysService.updateApiKeyIps(id, updateApiKeyDto);
  }
}
