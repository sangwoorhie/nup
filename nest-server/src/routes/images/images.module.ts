import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from 'src/entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  exports: [ImagesService],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
