import { PaymentRecord } from './../../entities/payment_record.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ImagesController from './images.controller';
import { ImagesService } from './images.service';
import { Image } from 'src/entities/image.entity';
import { User } from 'src/entities/user.entity';
import { ImageTilingService } from './image-tiling.service';

@Module({
  imports: [TypeOrmModule.forFeature([Image, User, PaymentRecord])],
  controllers: [ImagesController],
  providers: [ImagesService, ImageTilingService],
})
export class ImagesModule {}
