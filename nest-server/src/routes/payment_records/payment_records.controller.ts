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
import { AdminChargeDto, CreateChargeReqDto, DateReqDto } from './dto/req.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';
import { Usertype } from 'src/decorators/usertype.decorators';
import { UserType } from 'src/enums/enums';
import { PageReqDto } from 'src/common/dto/req.dto';
import { PageResDto } from 'src/common/dto/res.dto';
import { DeleteRecordsDto } from './dto/req.dto';

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

  // 2. 본인 포인트 충전 내역 조회 (사용자)
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

  // 3. 본인 포인트 충전내역 날짜별 조회 (사용자)
  // GET : localhost:3000/payment-records/charge/date-range?page=1&size=10&start_date=2023-01-01&end_date=2023-12-31
  @Get('charge/date-range')
  @ApiOperation({
    summary: '본인 포인트 충전내역 날짜별 조회 (사용자)',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiQuery({
    name: 'start_date',
    required: true,
    description: '충전 시작일',
  })
  @ApiQuery({
    name: 'end_date',
    required: true,
    description: '충전 마감일',
  })
  @ApiResponse({ status: 200, description: '성공' })
  async findChargeByDateRange(
    @Query() { page, size }: PageReqDto,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
    @User() user: UserAfterAuth,
  ) {
    const dateReqDto: DateReqDto = {
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    };

    return await this.paymentRecordsService.findChargeByDateRange(
      page,
      size,
      dateReqDto,
      user.id,
    );
  }

  // 4. 본인 포인트 거래내역 삭제 (사용자)
  // DELETE : localhost:3000/payment-records/charge/:payment_record_id
  @Delete('charge/:id')
  @ApiOperation({ summary: '사용자 본인 포인트 내역 삭제 (사용자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async deleteCharge(@Param('id') id: string, @User() user: UserAfterAuth) {
    return await this.paymentRecordsService.deleteCharge(id, user.id);
  }

  // 5. 포인트 충전 요청 목록 조회 (관리자)
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

  // 6. 포인트 충전 요청 목록 날짜별 조회 (관리자)
  // GET : localhost:3000/payment-records/admin/date-range?page=1&size=10&start_date=2023-01-01&end_date=2023-12-31
  @Get('admin/date-range')
  @Usertype(UserType.ADMIN)
  @ApiOperation({
    summary: '포인트 충전요청 기간조회 (관리자)',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiQuery({
    name: 'start_date',
    required: true,
    description: '충전 요청 시작일',
  })
  @ApiQuery({
    name: 'end_date',
    required: true,
    description: '충전 요청 마감일',
  })
  @ApiResponse({ status: 200, description: '성공' })
  async findChargeRequestByDateRange(
    @Query() { page, size }: PageReqDto,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    const dateReqDto: DateReqDto = {
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    };

    return await this.paymentRecordsService.findChargeRequestByDateRange(
      page,
      size,
      dateReqDto,
    );
  }

  // 7. 포인트 충전 또는 취소(반려) 처리 (관리자)
  // PATCH : localhost:3000/payment-records/admin/charge
  @Patch('admin/charge')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '사용자 포인트 충전 또는 취소(반려) 처리 (관리자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async confirmCharges(@Body() adminChargeDtos: AdminChargeDto[]) {
    return await this.paymentRecordsService.confirmCharges(adminChargeDtos);
  }

  // 8. 충전요청내역 삭제처리 (관리자)
  // DELETE : localhost:3000/payment-records/admin/charge
  @Delete('admin/charge')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '포인트 충전요청 내역 삭제처리 (관리자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async deleteRecords(@Body() deleteRecordsDto: DeleteRecordsDto) {
    return await this.paymentRecordsService.deleteRecords(deleteRecordsDto);
  }

  // 9. 회원 충전요청내역 조회 (관리자)
  // GET : localhost:3000/payment-records/admin/charge-request/:userId?page=1&size=20
  @Get('admin/charge-request/:userId')
  @Usertype(UserType.ADMIN)
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiOperation({ summary: '회원 충전요청내역 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async getUserChargeRequest(
    @Param('userId') userId: string,
    @Query() pageReqDto: PageReqDto,
  ) {
    const { page, size } = pageReqDto;
    return await this.paymentRecordsService.getUserChargeRequest(
      userId,
      page,
      size,
    );
  }

  // 10. 개인회원 결제내역 조회 (관리자)
  // GET : localhost:3000/payment-records/admin/payment-history/individual?page=1&size=20
  @Get('admin/payment-history/individual')
  @Usertype(UserType.ADMIN)
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiOperation({ summary: '개인회원 결제내역 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async getIndividualUsersPaymentHistory(@Query() pageReqDto: PageReqDto) {
    const { page, size } = pageReqDto;
    return await this.paymentRecordsService.getUsersPaymentHistory(
      UserType.INDIVIDUAL,
      page,
      size,
    );
  }

  // 11. 사업자회원 결제내역 조회 (관리자)
  // GET : localhost:3000/payment-records/admin/payment-history/corporate?page=1&size=20
  @Get('admin/payment-history/corporate')
  @Usertype(UserType.ADMIN)
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiOperation({ summary: '사업자회원 결제내역 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async getCorporateUsersPaymentHistory(@Query() pageReqDto: PageReqDto) {
    const { page, size } = pageReqDto;
    return await this.paymentRecordsService.getUsersPaymentHistory(
      UserType.CORPORATE,
      page,
      size,
    );
  }

  // 12. 개인회원 결제내역 날짜별 조회 (관리자)
  // GET : localhost:3000/payment-records/admin/payment-history/individual/date-range?page=1&size=10&start_date=2023-01-01&end_date=2023-12-31
  @Get('admin/payment-history/individual/date-range')
  @Usertype(UserType.ADMIN)
  @ApiOperation({
    summary: '개인회원 결제내역 날짜별 조회 (관리자)',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiQuery({
    name: 'start_date',
    required: true,
    description: '결제 내역 시작일',
  })
  @ApiQuery({
    name: 'end_date',
    required: true,
    description: '결제 내역 마감일',
  })
  @ApiResponse({ status: 200, description: '성공' })
  async findIndividualUsersPaymentHistoryByDateRange(
    @Query() { page, size }: PageReqDto,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    const dateReqDto: DateReqDto = {
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    };

    return await this.paymentRecordsService.findUsersPaymentHistoryByDateRange(
      UserType.INDIVIDUAL,
      page,
      size,
      dateReqDto,
    );
  }

  // 13. 사업자회원 결제내역 날짜별 조회 (관리자)
  // GET : localhost:3000/payment-records/admin/payment-history/corporate/date-range?page=1&size=10&start_date=2023-01-01&end_date=2023-12-31
  @Get('admin/payment-history/corporate/date-range')
  @Usertype(UserType.ADMIN)
  @ApiOperation({
    summary: '개인회원 결제내역 날짜별 조회 (관리자)',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiQuery({
    name: 'start_date',
    required: true,
    description: '결제 내역 시작일',
  })
  @ApiQuery({
    name: 'end_date',
    required: true,
    description: '결제 내역 마감일',
  })
  @ApiResponse({ status: 200, description: '성공' })
  async findCorporateUsersPaymentHistoryByDateRange(
    @Query() { page, size }: PageReqDto,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    const dateReqDto: DateReqDto = {
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    };

    return await this.paymentRecordsService.findUsersPaymentHistoryByDateRange(
      UserType.CORPORATE,
      page,
      size,
      dateReqDto,
    );
  }

  // 14. 본인 포인트 사용 내역 조회 (사용자)
  // GET : localhost:3000/payment-records/use?page=1&size=20
  @Get('use')
  @ApiOperation({ summary: '본인 포인트 사용 내역 조회 (사용자)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({ status: 200, description: '성공', type: PageResDto })
  async getUseHistory(
    @Query() pageReqDto: PageReqDto,
    @User() user: UserAfterAuth,
  ) {
    const { page, size } = pageReqDto;
    return await this.paymentRecordsService.getUseHistory(page, size, user.id);
  }

  // 15. 본인 포인트 사용내역 날짜별 조회 (사용자)
  // GET : localhost:3000/payment-records/use/date-range?page=1&size=10&start_date=2023-01-01&end_date=2023-12-31
  @Get('use/date-range')
  @ApiOperation({ summary: '본인 포인트 사용내역 날짜별 조회 (사용자)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiQuery({ name: 'start_date', required: true, description: '사용 시작일' })
  @ApiQuery({ name: 'end_date', required: true, description: '사용 종료일' })
  @ApiResponse({ status: 200, description: '성공', type: PageResDto })
  async findUseHistoryByDateRange(
    @Query() { page, size }: PageReqDto,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
    @User() user: UserAfterAuth,
  ) {
    const dateReqDto: DateReqDto = {
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    };

    return await this.paymentRecordsService.findUseHistoryByDateRange(
      page,
      size,
      dateReqDto,
      user.id,
    );
  }

  // 16. 회원 포인트 사용내역 조회 (관리자)
  // GET : localhost:3000/payment-records/admin/use/:userId?page=1&size=20
  @Get('admin/use/:userId')
  @Usertype(UserType.ADMIN)
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiOperation({ summary: '회원 포인트 사용내역 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async getUserPointUse(
    @Param('userId') userId: string,
    @Query() pageReqDto: PageReqDto,
  ) {
    const { page, size } = pageReqDto;
    return await this.paymentRecordsService.getUserPointUse(userId, page, size);
  }
}
