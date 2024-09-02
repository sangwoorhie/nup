import { PaymentRecord } from './../../entities/payment_record.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ImagesController from './images.controller';
import { ImagesService } from './images.service';
import { Image } from 'src/entities/image.entity';
import { User } from 'src/entities/user.entity';
import { Settings } from 'src/entities/setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image, User, PaymentRecord, Settings])],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
