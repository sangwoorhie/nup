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
// import { FilesInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
// import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
// import { Image } from 'src/entities/image.entity';
// import { Response } from 'express';
// import { DeleteImagesReqDto, DownloadImagesReqDto, ViewImagesReqDto } from './dto/req.dto';
// import { ImageResDto } from './dto/res.dto';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}
}

// @ApiTags('Images')
// @Controller('images')
// export class ImagesController {
//   constructor(private readonly imagesService: ImagesService) {}

//   // 1. 이미지 파일 업로드 (다중 파일 업로드 가능)
//   // POST : localhost:3000/images/upload
//   @Post('upload')
//   @UseInterceptors(FilesInterceptor('files'))
//   @ApiOperation({ summary: '이미지 파일 업로드 (다중 파일 업로드 가능)' })
//   @ApiConsumes('multipart/form-data')
//   @ApiResponse({ status: 201, description: 'Images uploaded successfully.' })
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         files: {
//           type: 'array',
//           items: {
//             type: 'string',
//             format: 'binary',
//           },
//         },
//       },
//     },
//   })
//   async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
//     return this.imagesService.uploadImages(files);
//   }

//   // 2. 이미지 파일 다운로드
//   // GET : localhost:3000/images/:id
//   @Get('download')
//   @ApiOperation({ summary: '이미지 파일 다운로드 (다중 파일 가능)' })
//   @ApiResponse({ status: 200, description: '이미지를 성공적으로 다운로드했습니다.' })
//   async downloadImages(@Query() query: DownloadImagesReqDto, @Res() res: Response) {
//     const files = await this.imagesService.downloadImages(query.ids);
//     for (const file of files) {
//       file.pipe(res, { end: false });
//     }
//     res.end();
//   }

//   // 3. 단일 이미지 보기
//   // GET : localhost:3000/images/view/:id
//   @Get('view/:id')
//   @ApiOperation({ summary: '업로드된 이미지 보기' })
//   @ApiResponse({ status: 200, description: '이미지를 성공적으로 조회했습니다.' })
//   @ApiParam({ name: 'id', required: true, description: 'Image ID' })
//   async viewImage(@Param('id') id: string, @Res() res: Response) {
//     const image = await this.imagesService.viewImage(id);
//     res.json(image);
//   }

//   // 4. 이미지 목록 보기
//   @Get('view')
//   @ApiOperation({ summary: '업로드된 이미지 보기 (다중 파일 가능)' })
//   @ApiResponse({ status: 200, description: '이미지를 성공적으로 조회했습니다.' })
//   async viewImages(@Query() query: ViewImagesReqDto, @Res() res: Response) {
//     const images = await this.imagesService.viewImages(query.ids);
//     res.json(images.map(image => new ImageResDto(image)));
//   }

//   // 5. 이미지 삭제
//   // DELETE : localhost:3000/images/:id
//   @Delete()
//   @ApiOperation({ summary: '업로드된 이미지 삭제 (다중 파일 가능)' })
//   @ApiResponse({ status: 200, description: '이미지를 성공적으로 삭제했습니다.' })
//   async deleteImages(@Body() deleteImagesDto: DeleteImagesReqDto) {
//     return this.imagesService.deleteImages(deleteImagesDto.ids);
//   }

//   // 6. 이미지 수정
//   // PATCH : localhost:3000/images/:id
//   @Patch(':id')
//   @ApiOperation({ summary: '업로드된 이미지 수정' })
//   @ApiResponse({ status: 200, description: '이미지 메타데이터를 성공적으로 수정했습니다.' })
//   @ApiParam({ name: 'id', required: true, description: 'Image ID' })
//   async modifyImage(@Param('id') id: string, @Body() updateData: Partial<Image>) {
//     return this.imagesService.modifyImage(id, updateData);
//   }
// }
