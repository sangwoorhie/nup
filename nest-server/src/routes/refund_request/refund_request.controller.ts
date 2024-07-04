import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RefundRequestService } from './refund_request.service';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RefundResAdminDto, RefundResDto } from './dto/res.dto';
import { RefundReqDto } from './dto/req.dto';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';
import { Usertype } from 'src/decorators/usertype.decorators';
import { UserType } from 'src/enums/enums';
import { PageReqDto } from 'src/common/dto/req.dto';

@Controller('refund-request')
export class RefundRequestController {
  constructor(private readonly refundRequestService: RefundRequestService) {}

  // 1. 환불요청 (사용자)
  @Post()
  @ApiOperation({ summary: '환불 요청' })
  @ApiResponse({
    status: 201,
    description: '환불 요청 성공',
    type: RefundResDto,
  })
  async requestRefund(
    @User() user: UserAfterAuth,
    @Body() refundReqDto: RefundReqDto,
  ) {
    return await this.refundRequestService.requestRefund(user.id, refundReqDto);
  }

  // 2. 전체 회원 환불 요청 목록 조회 (관리자)
  @Get('admin')
  @ApiOperation({ summary: '전체 회원 환불 요청 목록 조회' })
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

  // 3. 환불요청 완료 처리 (관리자)
  @Patch('admin/complete/:id')
  @ApiOperation({ summary: '환불 요청 완료 처리' })
  @ApiResponse({ status: 200, description: '환불 요청 완료 처리 성공' })
  @Usertype(UserType.ADMIN)
  async completeRefundRequest(@Param('id') id: string) {
    return await this.refundRequestService.completeRefundRequest(id);
  }

  // 4. 환불요청 삭제 (관리자)
  @Delete('admin/:id')
  @ApiOperation({ summary: '환불 요청 삭제' })
  @ApiResponse({ status: 200, description: '환불 요청 삭제 성공' })
  @Usertype(UserType.ADMIN)
  async deleteRefundRequest(@Param('id') id: string) {
    return await this.refundRequestService.deleteRefundRequest(id);
  }

  // 5. 본인 환불 요청 목록 조회 (사용자)
  @Get('me')
  @ApiOperation({ summary: '본인 환불 요청 목록 조회' })
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

  // 6. 환불요청 취소 (사용자)
  @Patch('cancel/:id')
  @ApiOperation({ summary: '본인 환불 요청 취소' })
  @ApiResponse({ status: 200, description: '환불 요청 취소 성공' })
  async cancelRefundRequest(
    @User() user: UserAfterAuth,
    @Param('id') id: string,
  ) {
    return await this.refundRequestService.cancelRefundRequest(user.id, id);
  }
}
