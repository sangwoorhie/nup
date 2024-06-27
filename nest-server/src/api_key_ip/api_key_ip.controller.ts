import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiKeyIpService } from './api_key_ip.service';
import { CreateApiKeyIpDto } from './dto/create-api_key_ip.dto';
import { UpdateApiKeyIpDto } from './dto/update-api_key_ip.dto';

@Controller('api-key-ip')
export class ApiKeyIpController {
  constructor(private readonly apiKeyIpService: ApiKeyIpService) {}

  @Post()
  create(@Body() createApiKeyIpDto: CreateApiKeyIpDto) {
    return this.apiKeyIpService.create(createApiKeyIpDto);
  }

  @Get()
  findAll() {
    return this.apiKeyIpService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apiKeyIpService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateApiKeyIpDto: UpdateApiKeyIpDto) {
    return this.apiKeyIpService.update(+id, updateApiKeyIpDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apiKeyIpService.remove(+id);
  }
}
