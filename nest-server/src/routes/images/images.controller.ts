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

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  // 1. 이미지 파일 업로드 (다중 파일 업로드 가능)
  // POST : localhost:3000/images/upload
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: '이미지 파일 업로드 (다중 파일 업로드 가능)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Images uploaded successfully.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @User() user: UserAfterAuth,
  ) {
    return this.imagesService.uploadImages(files, user.id);
  }

  // 2. 이미지 파일 다운로드
  // GET : localhost:3000/images/:id
  @Get('download')
  @ApiOperation({ summary: '이미지 파일 다운로드 (다중 파일 가능)' })
  @ApiResponse({
    status: 200,
    description: '이미지를 성공적으로 다운로드했습니다.',
  })
  async downloadImages(
    @Query() query: DownloadImagesReqDto,
    @Res() res: Response,
    @User() user: UserAfterAuth,
  ) {
    const files = await this.imagesService.downloadImages(query.ids, user.id);
    for (const file of files) {
      file.pipe(res, { end: false });
    }
    res.end();
  }

  // 3. 단일 이미지 보기
  // GET : localhost:3000/images/view/:id
  @Get('view/:id')
  @ApiOperation({ summary: '업로드된 이미지 보기' })
  @ApiResponse({
    status: 200,
    description: '이미지를 성공적으로 조회했습니다.',
  })
  @ApiParam({ name: 'id', required: true, description: 'Image ID' })
  async viewImage(
    @Param('id') id: string,
    @Res() res: Response,
    @User() user: UserAfterAuth,
  ) {
    const image = await this.imagesService.viewImage(id, user.id);
    res.json(image);
  }

  // 4. 이미지 목록 보기
  // GET : localhost:3000/images/view?page=1&size=10
  @Get('view')
  @ApiOperation({ summary: '업로드된 이미지 보기 (다중 파일 가능)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({
    status: 200,
    description: '이미지를 성공적으로 조회했습니다.',
  })
  async viewImages(
    @Query() { page, size }: PageReqDto,
    @Query() query: ViewImagesReqDto,
    @User() user: UserAfterAuth,
  ) {
    return await this.imagesService.viewImages(page, size, query.ids, user.id);
  }

  // 5. 이미지 삭제
  // DELETE : localhost:3000/images/:id
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

  // 6. 이미지 수정
  // PATCH : localhost:3000/images/:id
  @Patch(':id')
  @ApiOperation({ summary: '업로드된 이미지 수정' })
  @ApiResponse({
    status: 200,
    description: '이미지 메타데이터를 성공적으로 수정했습니다.',
  })
  @ApiParam({ name: 'id', required: true, description: 'Image ID' })
  async modifyImage(
    @Param('id') id: string,
    @Body() updateData: Partial<Image>,
    @User() user: UserAfterAuth,
  ) {
    return this.imagesService.modifyImage(id, updateData, user.id);
  }
}
