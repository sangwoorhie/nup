import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { RefundRequestService } from './refund_request.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AmountResDto, RefundResAdminDto, RefundResDto } from './dto/res.dto';
import { DateReqDto, RefundReqDto } from './dto/req.dto';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';
import { Usertype } from 'src/decorators/usertype.decorators';
import { UserType } from 'src/enums/enums';
import { PageReqDto } from 'src/common/dto/req.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/multer.options';
import { readFileSync } from 'fs';
import { Response } from 'express';

@ApiTags('Refund-Request')
@Controller('refund-request')
export class RefundRequestController {
  constructor(private readonly refundRequestService: RefundRequestService) {}

  // 1. 본인 현금충전 포인트 조회 (사용자)
  // GET : localhost:3000/refund-request
  @Get()
  @ApiOperation({
    summary: '본인 포인트(전체포인트/현금충전포인트) 조회 (사용자)',
  })
  @ApiResponse({
    status: 201,
    description: '본인 포인트 조회 성공',
    type: AmountResDto,
  })
  async userCurrentPoint(@User() user: UserAfterAuth): Promise<AmountResDto> {
    return await this.refundRequestService.userCurrentPoint(user.id);
  }

  // 2. 환불요청 (사용자)
  // POST : localhost:3000/refund-request
  @Post()
  @UseInterceptors(FileInterceptor('bank_account_copy', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '환불 요청 (사용자)' })
  @ApiBody({ type: RefundResDto })
  @ApiResponse({
    status: 201,
    description: '환불 요청 성공',
    type: RefundResDto,
  })
  async requestRefund(
    @User() user: UserAfterAuth,
    @Body() refundReqDto: RefundReqDto,
    @UploadedFile() bankAccountCopy: Express.Multer.File,
  ) {
    const base64Image = readFileSync(bankAccountCopy.path).toString('base64');
    refundReqDto.bank_account_copy = `data:${bankAccountCopy.mimetype};base64,${base64Image}`;
    const userCurrentPoint = await this.refundRequestService.userCurrentPoint(
      user.id,
    );
    return await this.refundRequestService.requestRefund(
      user.id,
      refundReqDto,
      userCurrentPoint.cash_point,
    );
  }

  // 3. 본인 환불 요청 목록 조회 (사용자)
  // GET : localhost:3000/refund-request/me?page=1&size=20
  @Get('me')
  @ApiOperation({ summary: '본인 환불 요청 목록 조회 (사용자)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({
    status: 200,
    description: '본인 환불 요청 목록 조회 성공',
    type: [RefundResDto],
  })
  async getMyRefundRequests(
    @User() user: UserAfterAuth,
    @Query() pageReqDto: PageReqDto,
  ) {
    const { page, size } = pageReqDto;
    return await this.refundRequestService.getMyRefundRequests(
      user.id,
      page,
      size,
    );
  }

  // 4. 본인 환불 요청 목록 날짜별 조회 (사용자)
  // GET : localhost:3000/refund-request/me/date-range?page=1&size=10&start_date=2023-01-01&end_date=2023-12-31
  @Get('me/date-range')
  @ApiOperation({
    summary: '포인트 환불요청 기간조회 (사용자)',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiQuery({
    name: 'start_date',
    required: true,
    description: '환불 요청 시작일',
  })
  @ApiQuery({
    name: 'end_date',
    required: true,
    description: '환불 요청 마감일',
  })
  @ApiResponse({ status: 200, description: '성공' })
  async findRefundRequestByDateRange(
    @User() user: UserAfterAuth,
    @Query() { page, size }: PageReqDto,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    const dateReqDto: DateReqDto = {
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    };

    return await this.refundRequestService.findRefundRequestByDateRange(
      page,
      size,
      dateReqDto,
      user.id,
    );
  }

  // 5. 본인 환불요청 취소 (사용자)
  // PATCH : localhost:3000/refund-request/cancel
  @Patch('cancel')
  @ApiOperation({ summary: '본인 환불 요청 취소 (사용자)' })
  @ApiResponse({ status: 200, description: '환불 요청 취소 성공' })
  async cancelRefundRequests(
    @User() user: UserAfterAuth,
    @Body('ids') ids: string[],
  ) {
    return await this.refundRequestService.cancelRefundRequests(user.id, ids);
  }

  // 6. 본인 환불요청 기록 삭제 (사용자)
  // DELETE : localhost:3000/refund-request/remove
  @Delete('remove')
  @ApiOperation({ summary: '본인 환불 요청 기록 삭제' })
  @ApiResponse({ status: 200, description: '본인 환불 요청 기록 삭제 성공' })
  async deleteRefundRequests(
    @User() user: UserAfterAuth,
    @Body('ids') ids: string[],
  ) {
    return await this.refundRequestService.deleteRefundRequests(user.id, ids);
  }

  // 7. 전체 회원 환불 요청 목록 조회 (관리자)
  // GET : localhost:3000/refund-request/admin?page=1&size=20
  @Get('admin')
  @ApiOperation({ summary: '전체 회원 환불 요청 목록 조회 (관리자)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({
    status: 200,
    description: '환불 요청 목록 조회 성공',
    type: [RefundResAdminDto],
  })
  @Usertype(UserType.ADMIN)
  async getAllRefundRequests(@Query() pageReqDto: PageReqDto) {
    return await this.refundRequestService.getAllRefundRequests(
      pageReqDto.page,
      pageReqDto.size,
    );
  }

  // 8. 환불요청 완료 처리 (관리자)
  // PATCH : localhost:3000/refund-request/admin/complete
  @Patch('admin/complete')
  @ApiOperation({ summary: '환불 요청 완료 처리 (관리자)' })
  @ApiResponse({ status: 200, description: '환불 요청 완료 처리 성공' })
  @Usertype(UserType.ADMIN)
  async completeRefundRequest(@Body('ids') ids: string[]) {
    return await this.refundRequestService.completeRefundRequest(ids);
  }

  // 9. 환불요청 기록 삭제 (관리자)
  // DELETE : localhost:3000/refund-request/admin/cancel
  @Delete('admin/cancel')
  @ApiOperation({ summary: '환불 요청 삭제 (관리자)' })
  @ApiResponse({ status: 200, description: '환불 요청 삭제 성공' })
  @Usertype(UserType.ADMIN)
  async deleteRefundRequestAdmin(@Body('ids') ids: string[]) {
    return await this.refundRequestService.deleteRefundRequestAdmin(ids);
  }

  // 10. 환불 통장사본 이미지 다운로드 (관리자)
  // GET : localhost:3000/refund-request/admin/download/:refundRequest_Id
  @Get('admin/download/:refundRequestId')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '통장사본 이미지 다운로드' })
  @ApiResponse({ status: 200, description: '통장사본 이미지 다운로드 성공' })
  async downloadImageAdmin(
    @Param('refundRequestId') refundRequestId: string,
    @Res() res: Response,
  ): Promise<void> {
    const { fileBuffer, fileName, mimeType } =
      await this.refundRequestService.downloadImageAdmin(refundRequestId);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(fileBuffer);
  }
}
