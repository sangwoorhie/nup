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
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AmountResDto, RefundResAdminDto, RefundResDto } from './dto/res.dto';
import { RefundReqDto } from './dto/req.dto';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';
import { Usertype } from 'src/decorators/usertype.decorators';
import { UserType } from 'src/enums/enums';
import { PageReqDto } from 'src/common/dto/req.dto';

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
  @ApiOperation({ summary: '환불 요청 (사용자)' })
  @ApiResponse({
    status: 201,
    description: '환불 요청 성공',
    type: RefundResDto,
  })
  async requestRefund(
    @User() user: UserAfterAuth,
    @Body() refundReqDto: RefundReqDto,
  ) {
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

  // 4. 본인 환불요청 취소 (사용자)
  // PATCH : localhost:3000/refund-request/cancel/:id
  @Patch('cancel/:id')
  @ApiOperation({ summary: '본인 환불 요청 취소 (사용자)' })
  @ApiResponse({ status: 200, description: '환불 요청 취소 성공' })
  async cancelRefundRequest(
    @User() user: UserAfterAuth,
    @Param('id') id: string,
  ) {
    return await this.refundRequestService.cancelRefundRequest(user.id, id);
  }

  // 5. 전체 회원 환불 요청 목록 조회 (관리자)
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

  // 6. 환불요청 완료 처리 (관리자)
  // PATCH : localhost:3000/refund-request/admin/complete/{refundRequestId}
  @Patch('admin/complete/:id')
  @ApiOperation({ summary: '환불 요청 완료 처리 (관리자)' })
  @ApiResponse({ status: 200, description: '환불 요청 완료 처리 성공' })
  @Usertype(UserType.ADMIN)
  async completeRefundRequest(@Param('id') id: string) {
    return await this.refundRequestService.completeRefundRequest(id);
  }

  // 7. 환불요청 삭제 (관리자)
  // DELETE : localhost:3000/refund-request/admin/{refundRequestId}
  @Delete('admin/:id')
  @ApiOperation({ summary: '환불 요청 삭제 (관리자)' })
  @ApiResponse({ status: 200, description: '환불 요청 삭제 성공' })
  @Usertype(UserType.ADMIN)
  async deleteRefundRequest(@Param('id') id: string) {
    return await this.refundRequestService.deleteRefundRequest(id);
  }
}
