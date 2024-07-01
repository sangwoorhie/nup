import { Module } from '@nestjs/common';
import { ApiKeyIpService } from './api_key_ip.service';
import { ApiKeyIpController } from './api_key_ip.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyIp } from 'src/entities/api_key_ip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeyIp])],
  exports: [ApiKeyIpService],
  controllers: [ApiKeyIpController],
  providers: [ApiKeyIpService],
})
export class ApiKeyIpModule {}
