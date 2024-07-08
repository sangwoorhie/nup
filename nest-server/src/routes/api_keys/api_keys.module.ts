import { Module } from '@nestjs/common';
import { ApiKeysService } from './api_keys.service';
import { ApiKeysController } from './api_keys.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeys } from 'src/entities/api_key.entity';
import { User } from 'src/entities/user.entity';
import { TokenUsage } from 'src/entities/token_usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeys, User, TokenUsage])],
  exports: [ApiKeysService],
  controllers: [ApiKeysController],
  providers: [ApiKeysService],
})
export class ApiKeysModule {}
