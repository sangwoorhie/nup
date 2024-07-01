import { Module } from '@nestjs/common';
import { CorporatesService } from './corporates.service';
import { CorporatesController } from './corporates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Corporate } from 'src/entities/corporate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Corporate])],
  exports: [CorporatesService],
  controllers: [CorporatesController],
  providers: [CorporatesService],
})
export class CorporatesModule {}
