import { Module } from '@nestjs/common';
import { ApiLogsService } from './api_logs.service';
import { ApiLogsController } from './api_logs.controller';

@Module({
  controllers: [ApiLogsController],
  providers: [ApiLogsService],
})
export class ApiLogsModule {}
