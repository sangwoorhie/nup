import { Module } from '@nestjs/common';
import { ApiKeysService } from './api_keys.service';
import { ApiKeysController } from './api_keys.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeys } from 'src/entities/api_key.entity';
import { ApiLog } from 'src/entities/api_log.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeys, ApiLog, User])],
  exports: [ApiKeysService],
  controllers: [ApiKeysController],
  providers: [ApiKeysService],
})
export class ApiKeysModule {}
