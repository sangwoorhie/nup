import { Module } from '@nestjs/common';
import { TokenUsageService } from './token_usage.service';
import { TokenUsageController } from './token_usage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenUsage } from 'src/entities/token_usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TokenUsage])],
  controllers: [TokenUsageController],
  providers: [TokenUsageService],
})
export class TokenUsageModule {}
