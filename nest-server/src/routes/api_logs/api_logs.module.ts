import { Module } from '@nestjs/common';
import { ApiLogsService } from './api_logs.service';
import { ApiLogsController } from './api_logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiLog } from 'src/entities/api_log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiLog])],
  exports: [ApiLogsService],
  controllers: [ApiLogsController],
  providers: [ApiLogsService],
})
export class ApiLogsModule {}
