import { Module } from '@nestjs/common';
import { ApiKeysService } from './api_keys.service';
import { ApiKeysController } from './api_keys.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeys } from 'src/entities/api_key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeys])],
  exports: [ApiKeysService],
  controllers: [ApiKeysController],
  providers: [ApiKeysService],
})
export class ApiKeysModule {}
