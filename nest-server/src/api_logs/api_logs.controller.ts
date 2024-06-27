import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiLogsService } from './api_logs.service';
import { CreateApiLogDto } from './dto/create-api_log.dto';
import { UpdateApiLogDto } from './dto/update-api_log.dto';

@Controller('api-logs')
export class ApiLogsController {
  constructor(private readonly apiLogsService: ApiLogsService) {}

  @Post()
  create(@Body() createApiLogDto: CreateApiLogDto) {
    return this.apiLogsService.create(createApiLogDto);
  }

  @Get()
  findAll() {
    return this.apiLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apiLogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateApiLogDto: UpdateApiLogDto) {
    return this.apiLogsService.update(+id, updateApiLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apiLogsService.remove(+id);
  }
}
