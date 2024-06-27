import { Module } from '@nestjs/common';
import { ApiKeyIpService } from './api_key_ip.service';
import { ApiKeyIpController } from './api_key_ip.controller';

@Module({
  controllers: [ApiKeyIpController],
  providers: [ApiKeyIpService],
})
export class ApiKeyIpModule {}
