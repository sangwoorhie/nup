import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  Res,
  Delete,
  Patch,
  Body,
  Query,
  Header,
  BadRequestException,
} from '@nestjs/common';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Image } from 'src/entities/image.entity';
import { Response } from 'express';
import {
  DeleteImagesReqDto,
  DownloadImagesReqDto,
  ViewImagesReqDto,
} from './dto/req.dto';
import { ImageResDto } from './dto/res.dto';
import { PageReqDto } from 'src/common/dto/req.dto';
import { PassThrough } from 'stream';
import { isUUID } from 'class-validator';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  // 1. 이미지 파일 업로드 (다중 파일 업로드 가능)
  // POST : localhost:3000/images/upload
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: '이미지 파일 업로드 (다중 파일 가능)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: '이미지를 성공적으로 업로드했습니다.',
  })
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @User() user: UserAfterAuth,
  ) {
    const { images, totalCost } = await this.imagesService.uploadImages(
      files,
      user.id,
    );

    return {
      message: 'Images uploaded successfully.',
      images,
      totalCost,
    };
  }

  // 2. 이미지 파일 다운로드
  // GET : localhost:3000/images/download?imageIds=id1,id2,id3&zip=true
  // GET : localhost:3000/images/download?imageIds=id1,id2,id3&zip=false
  @Get('download')
  @ApiOperation({ summary: '이미지 파일 다운로드 (다중 파일 가능)' })
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename=images.zip')
  @ApiResponse({
    status: 200,
    description: '이미지를 성공적으로 다운로드했습니다.',
  })
  async downloadImages(
    @Query('imageIds') imageIds: string | string[],
    @Query('zip') zip: boolean,
    @Res() res: Response,
    @User() user: UserAfterAuth,
  ) {
    // Ensure imageIds is an array by splitting it if it's a string
    const ids = typeof imageIds === 'string' ? imageIds.split(',') : imageIds;

    // Validate imageIds as UUIDs
    const invalidIds = ids.filter((id) => !isUUID(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid UUIDs provided: ${invalidIds.join(', ')}`,
      );
    }
    const stream = await this.imagesService.downloadImages(ids, zip, user.id);
    if (zip) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=images.zip');
      (stream as PassThrough).pipe(res);
    } else {
      for (const fileStream of stream as any[]) {
        fileStream.pipe(res);
      }
    }
  }

  // 3. 단일 이미지 보기
  // GET : localhost:3000/images/view/:id
  @Get('view/:id')
  // @Header('Content-Type', 'image/jpeg')
  @ApiOperation({ summary: '단일 이미지 보기' })
  @ApiResponse({
    status: 200,
    description: '이미지를 성공적으로 조회했습니다.',
  })
  async viewImage(
    @Param('id') id: string,
    @Res() res: Response,
    @User() user: UserAfterAuth,
  ) {
    const imageStream = await this.imagesService.viewImage(id, user.id);
    imageStream.pipe(res);
  }

  // 4. 이미지 목록 보기(텍스트 형태)
  // GET : localhost:3000/images/list
  @Get('list')
  @ApiOperation({ summary: '이미지 목록 보기 (텍스트 형태)' })
  @ApiResponse({
    status: 200,
    description: '이미지 목록을 성공적으로 조회했습니다.',
  })
  async listImages(@User() user: UserAfterAuth) {
    return this.imagesService.listImages(user.id);
  }

  // 5. 이미지 목록 보기(갤러리 형태)
  // GET : localhost:3000/images/view?imageIds=id1,id2,id3
  @Get('view')
  @ApiOperation({ summary: '업로드된 이미지 보기 (갤러리 형태)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({
    status: 200,
    description: '이미지를 성공적으로 조회했습니다.',
  })
  async viewImages(
    @Query('imageIds') imageIds: string,
    @Res() res: Response,
    @User() user: UserAfterAuth,
  ) {
    const ids = typeof imageIds === 'string' ? imageIds.split(',') : imageIds;
    const invalidIds = ids.filter((id) => !isUUID(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid UUIDs provided: ${invalidIds.join(', ')}`,
      );
    }
    const imageStreams = await this.imagesService.viewImages(ids, user.id);

    res.setHeader('Content-Type', 'multipart/mixed');
    for (const stream of imageStreams) {
      await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
        stream.pipe(res, { end: false });
      });
    }
    res.end();
  }

  // 6. 이미지 삭제
  // DELETE : localhost:3000/images { "ids": ["id1","id2", "id3"] }
  @Delete()
  @ApiOperation({ summary: '업로드된 이미지 삭제 (다중 파일 가능)' })
  @ApiResponse({
    status: 200,
    description: '이미지를 성공적으로 삭제했습니다.',
  })
  async deleteImages(
    @Body() deleteImagesDto: DeleteImagesReqDto,
    @User() user: UserAfterAuth,
  ) {
    return this.imagesService.deleteImages(deleteImagesDto.ids, user.id);
  }
}
