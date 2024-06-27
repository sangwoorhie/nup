import { Module } from '@nestjs/common';
import { CorporatesService } from './corporates.service';
import { CorporatesController } from './corporates.controller';

@Module({
  controllers: [CorporatesController],
  providers: [CorporatesService],
})
export class CorporatesModule {}
