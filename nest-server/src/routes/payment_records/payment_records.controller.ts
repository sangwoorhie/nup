import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { PaymentRecordsService } from './payment_records.service';
import { AdminChargeDto, CreateChargeReqDto } from './dto/req.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';
import { Usertype } from 'src/decorators/usertype.decorators';
import { UserType } from 'src/enums/enums';
import { PageReqDto } from 'src/common/dto/req.dto';
import { PageResDto } from 'src/common/dto/res.dto';

@ApiTags('Payment-Record')
@Controller('payment-records')
export class PaymentRecordsController {
  constructor(private readonly paymentRecordsService: PaymentRecordsService) {}

  // 1. 현금결제 포인트 충전 요청 (사용자)
  // POST : localhost:3000/payment-records/charge
  @Post('charge')
  @ApiOperation({ summary: '현금결제 포인트 충전요청 (사용자)' })
  @ApiResponse({
    status: 200,
    description: '이메일로 입금 계좌정보가 전송되었습니다.',
  })
  async createCharge(
    @Body() createChargeReqDto: CreateChargeReqDto,
    @User() user: UserAfterAuth,
  ) {
    await this.paymentRecordsService.createCharge(createChargeReqDto, user.id);
    return { message: '이메일로 입금 계좌정보가 전송되었습니다.' };
  }

  // 2.본인 포인트 충전 내역 조회 (사용자)
  // GET : localhost:3000/payment-records/charge?page=1&size=20
  @Get('charge')
  @ApiOperation({ summary: '본인 포인트 충전 내역 조회 (사용자)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: PageResDto,
  })
  async getCharge(
    @Query() pageReqDto: PageReqDto,
    @User() user: UserAfterAuth,
  ) {
    const { page, size } = pageReqDto;
    return await this.paymentRecordsService.getCharge(page, size, user.id);
  }

  // 3. 본인 포인트 거래내역 삭제 (사용자)
  // DELETE : localhost:3000/payment-records/charge/:payment_record_id
  @Delete('charge/:id')
  @ApiOperation({ summary: '사용자 본인 포인트 내역 삭제 (사용자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async deleteCharge(@Param('id') id: string, @User() user: UserAfterAuth) {
    return await this.paymentRecordsService.deleteCharge(id, user.id);
  }

  // 4. 포인트 충전 요청 목록 조회 (관리자)
  // GET : localhost:3000/payment-records/admin/charge
  // GET : localhost:3000/payment-records/admin/charge?page=1&size=20
  @Get('admin/charge')
  @Usertype(UserType.ADMIN)
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiOperation({ summary: '포인트 충전 요청 목록 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async getPendingCharges(@Query() pageReqDto: PageReqDto) {
    const { page, size } = pageReqDto;
    return await this.paymentRecordsService.getPendingCharges(page, size);
  }

  // 5. 포인트 충전 또는 취소 처리 (관리자)
  // PATCH : localhost:3000/payment-records/admin/charge/:payment_record_id
  @Patch('admin/charge/:id')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '사용자 포인트 충전 또는 취소 처리 (관리자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async confirmCharge(
    @Param('id') id: string,
    @Body() adminChargeDto: AdminChargeDto,
  ) {
    return await this.paymentRecordsService.confirmCharge(id, adminChargeDto);
  }
}
