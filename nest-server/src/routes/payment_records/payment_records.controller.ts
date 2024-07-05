import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { PaymentRecordsService } from './payment_records.service';
import { AdminChargeDto, CreateChargeDto } from './dto/req.dto';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';
import { Usertype } from 'src/decorators/usertype.decorators';
import { UserType } from 'src/enums/enums';
import { PageReqDto } from 'src/common/dto/req.dto';

@Controller('payment-records')
export class PaymentRecordsController {
  constructor(private readonly paymentRecordsService: PaymentRecordsService) {}

  // 1. 현금결제 포인트 충전 (사용자)
  @Post('charge')
  @ApiOperation({ summary: '현금결제 포인트 충전' })
  @ApiResponse({ status: 200, description: '성공' })
  async createCharge(
    @Body() createChargeDto: CreateChargeDto,
    @User() user: UserAfterAuth,
  ) {
    return this.paymentRecordsService.createCharge(createChargeDto, user.id);
  }

  // 2. 포인트 충전 요청 목록 조회 (관리자)
  @Get('admin/charges')
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiOperation({ summary: '포인트 충전 요청 목록 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async getPendingCharges(@Query() { page, size }: PageReqDto) {
    return this.paymentRecordsService.getPendingCharges(page, size);
  }

  // 3. 포인트 충전 처리 (관리자)
  @Patch('admin/charge/:id')
  @ApiOperation({ summary: '포인트 충전 처리 (관리자)' })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async confirmCharge(
    @Param('id') id: string,
    @Body() adminChargeDto: AdminChargeDto,
  ) {
    return this.paymentRecordsService.confirmCharge(id, adminChargeDto);
  }
}
