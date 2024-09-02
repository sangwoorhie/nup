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
  NotFoundException,
  StreamableFile,
  InternalServerErrorException,
  UploadedFile,
} from '@nestjs/common';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
  DetectImagesReqDto,
  DownloadImagesReqDto,
  ModifyCostReqDto,
  ViewImagesReqDto,
} from './dto/req.dto';
import { ImageResDto, ModifyCostResDto } from './dto/res.dto';
import { PageReqDto } from 'src/common/dto/req.dto';
import { PassThrough } from 'stream';
import { isUUID } from 'class-validator';
// import { UserType } from 'src/enums/enums';
import { Usertype } from 'src/decorators/usertype.decorators';
import { UserType } from 'src/enums/enums';

@ApiTags('Images')
@Controller('images')
export default class ImagesController {
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
    const { images, totalCost, imageCosts } =
      await this.imagesService.uploadImages(files, user.id);

    return {
      message: 'Images uploaded successfully.',
      images,
      totalCost,
      imageCosts, // Returning the cost of each individual image
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
    const { imageStream, contentType, cost } =
      await this.imagesService.viewImage(id, user.id);
    if (!imageStream) {
      throw new NotFoundException('이미지를 찾을 수 없습니다.');
    }
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Image-Cost', cost.toString()); // You can also send cost in headers or in the response body
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

  // 7. 이미지 디텍팅 및 포인트 차감 => 9번과 합쳐져야 함
  // POST : localhost:3000/images/detect { "ids": ["id1","id2", "id3"] }
  @Post('detect')
  @ApiOperation({ summary: '이미지 디텍팅 및 포인트 차감' })
  @ApiResponse({
    status: 200,
    description: '이미지를 성공적으로 감지했습니다.',
  })
  async detectImages(
    @Body() detectImagesDto: ViewImagesReqDto, // Reuse DTO for listing images
    @User() user: UserAfterAuth,
  ) {
    const { detectedImages, usedPoints, remainingPoints } =
      await this.imagesService.detectImages(detectImagesDto.ids, user.id);

    return {
      message: 'Images detected successfully.',
      detectedImages,
      usedPoints,
      remainingPoints,
    };
  }

  // 8. 단일 이미지 메타데이터 보기
  // GET : localhost:3000/images/metadata/:id
  @Get('metadata/:id')
  @ApiOperation({ summary: '단일 이미지 메타데이터 보기' })
  @ApiResponse({
    status: 200,
    description: '이미지 메타데이터를 성공적으로 조회했습니다.',
  })
  async getImageMetadata(
    @Param('id') id: string,
    @User() user: UserAfterAuth,
    @Query('flightHeight') flightHeight?: number,
  ) {
    const metadata = await this.imagesService.getImageMetadata(
      id,
      user.id,
      flightHeight,
    );
    return {
      message: 'Image metadata retrieved successfully.',
      metadata,
    };
  }

  // 9. 특정 이미지 타일링(디텍팅) 요청 => 7번과 합쳐져야 함
  // POST : localhost:3000/images/tile/:id
  @Post('tile/:id')
  @ApiOperation({ summary: '특정 이미지에 대한 타일링 요청' })
  @ApiResponse({
    status: 200,
    description: '이미지 타일링 요청이 성공적으로 처리되었습니다.',
  })
  async tileImage(
    @Param('id') id: string,
    @User() user: UserAfterAuth,
    @Body('data') jsonData: string, // JSON data as string
    @Res() res: Response,
  ) {
    const { tileUrl, outputBuffer } = await this.imagesService.tileImage(
      id,
      user.id,
      jsonData,
    );

    // Determine the content type based on the image extension
    const imageExtension = tileUrl.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg'; // Default to jpeg

    if (imageExtension === 'png') {
      contentType = 'image/png';
    } else if (imageExtension === 'jpg' || imageExtension === 'jpeg') {
      contentType = 'image/jpeg';
    }

    res.setHeader('Content-Type', contentType); // Set appropriate content type
    res.setHeader('X-Tile-Url', tileUrl); // Optionally include the URL in headers
    res.send(outputBuffer); // Stream the image buffer back to the client
  }

  // 10. 수치해석 변경 (단일 이미지)
  // PATCH : localhost:3000/images/metadata/:id
  @Patch('metadata/:id')
  @ApiOperation({ summary: '단일 이미지의 GSD 및 Altitude(촬영거리) 수정' })
  @ApiResponse({
    status: 200,
    description: '이미지 메타데이터를 성공적으로 수정했습니다.',
  })
  async modifyImageMetadata(
    @Param('id') id: string,
    @User() user: UserAfterAuth,
    @Body() updateData: { gsd?: string; altitudeUsed?: number },
  ) {
    const updatedMetadata = await this.imagesService.modifyImageMetadata(
      id,
      user.id,
      updateData,
    );
    return {
      message: 'Image metadata updated successfully.',
      metadata: updatedMetadata,
    };
  }

  // 11. 수치해석 변경 (전체 이미지)
  // PATCH : localhost:3000/images/metadata/user/all
  @Patch('metadata/user/all')
  @ApiOperation({
    summary: '사용자의 모든 이미지의 GSD 및 Altitude(촬영거리) 수정',
  })
  @ApiResponse({
    status: 200,
    description: '모든 이미지 메타데이터를 성공적으로 수정했습니다.',
  })
  async modifyAllImagesMetadata(
    @User() user: UserAfterAuth,
    @Body() updateData: { gsd?: string; altitudeUsed?: number },
  ) {
    const updatedImages = await this.imagesService.modifyAllImagesMetadata(
      user.id,
      updateData,
    );
    return {
      message: 'All images metadata updated successfully.',
      images: updatedImages,
    };
  }

  // 12. 이미지 가격 배율 및 삭감금액 설정 (관리자)
  // PATCH : localhost:3000/images/admin/cost
  @Patch('admin/cost')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '이미지 가격 배율 및 삭감금액 설정 (관리자)' })
  @ApiResponse({
    status: 200,
    description: '가격 로직이 성공적으로 변경되었습니다.',
  })
  async setCostingLogic(@Body() modifyCostReqDto: ModifyCostReqDto) {
    const result = await this.imagesService.setCostingLogic(modifyCostReqDto);
    return {
      message: '가격 로직이 성공적으로 변경되었습니다.',
      updatedImages: result,
    };
  }

  // 13. 현재 이미지 가격 배율 및 삭감금액 조회 (관리자)
  // GET : localhost:3000/images/admin/cost
  @Get('admin/cost')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '이미지 가격 배율 및 삭감금액 조회 (관리자)' })
  @ApiResponse({
    status: 200,
    description: '가격 로직이 성공적으로 조회되었습니다.',
  })
  async getCostingSettings(): Promise<ModifyCostResDto> {
    return await this.imagesService.getCostingSettings();
  }
}
