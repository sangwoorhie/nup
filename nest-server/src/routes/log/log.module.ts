import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from 'src/entities/log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  exports: [LogService],
  controllers: [LogController],
  providers: [LogService],
})
export class LogModule {}
