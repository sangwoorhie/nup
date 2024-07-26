import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CouponTemplatesService } from './coupon_templates.service';
import {
  CreateCouponReqDto,
  DateReqDto,
  FindByCouponNameReqDto,
  FindCouponReqDto1,
  FindCouponReqDto2,
  FindCouponTemplateReqDto,
  UpdateCouponReqDto,
} from './dto/req.dto';
import {
  CreateCouponResDto,
  FindCouponResDto,
  FindCouponTemplateResDto,
  FindOneCouponTemplateResDto,
} from './dto/res.dto';
import {
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Usertype } from 'src/decorators/usertype.decorators';
import { UserType } from 'src/enums/enums';
import { PageReqDto } from 'src/common/dto/req.dto';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';
import { CouponsService } from '../coupons/coupons.service';

@ApiTags('Coupon_Template')
@ApiExtraModels(
  CreateCouponReqDto,
  UpdateCouponReqDto,
  DateReqDto,
  CreateCouponResDto,
  FindCouponTemplateResDto,
  FindByCouponNameReqDto,
) // DTO들 입력
@Controller('coupon-templates')
export class CouponTemplatesController {
  constructor(
    private readonly couponTemplatesService: CouponTemplatesService,
    private readonly couponService: CouponsService,
  ) {}

  // 1. 쿠폰 템플릿 생성 (관리자)
  // POST : localhost:3000/coupon-templates
  @Post()
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '쿠폰 템플릿 생성 (관리자)' })
  @ApiResponse({ status: 200, description: '성공', type: CreateCouponResDto })
  async createCouponTemplate(
    @User() user: UserAfterAuth,
    @Body() createCouponReqDto: CreateCouponReqDto,
  ) {
    return this.couponTemplatesService.createCouponTemplate(
      createCouponReqDto,
      user.id,
    );
  }

  // 2. 쿠폰 템플릿 조회 - 전체조회 or 유효쿠폰조회 or 만료쿠폰조회 (관리자)
  // GET : localhost:3000/coupon-templates?page=1&size=20&criteria=all
  @Get()
  @Usertype(UserType.ADMIN)
  @ApiOperation({
    summary:
      '쿠폰 템플릿 필터 조회 (전체조회 or 유효쿠폰조회 or 만료쿠폰조회) (관리자)',
  })
  @ApiQuery({
    name: 'criteria',
    enum: ['all', 'non-expired', 'expired'],
    required: true,
    description:
      '쿠폰 템플릿 목록을 전체조회할 것인지 유효쿠폰만 조회할것인지 만료쿠폰만 조회할것인지 선택',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({ status: 200, description: '성공' })
  async findCouponTemplates(
    @Query() { page, size }: PageReqDto,
    @Query('criteria') criteria: 'all' | 'non-expired' | 'expired',
  ) {
    const findCouponTemplateReqDto = new FindCouponTemplateReqDto();
    findCouponTemplateReqDto.criteria = criteria;

    return this.couponTemplatesService.findCouponTemplates(
      findCouponTemplateReqDto,
      page,
      size,
    );
  }

  // 3. 쿠폰명으로 쿠폰 템플릿 조회 (관리자)
  // GET : localhost:3000/coupon-templates/name?coupon_name=DiscountCoupon
  @Get('name')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '쿠폰명으로 쿠폰 템플릿 조회 (관리자)' })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: [FindOneCouponTemplateResDto],
  })
  async findCouponTemplateByName(
    @Query() findByCouponNameReqDto: FindByCouponNameReqDto,
  ) {
    return this.couponTemplatesService.findCouponTemplateByName(
      findByCouponNameReqDto.coupon_name,
    );
  }

  // 4. 쿠폰 템플릿 발행수량 추가 (관리자)
  // PATCH : localhost:3000/coupon-templates/:template_id
  @Patch(':id')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '쿠폰 템플릿 발행수량 변경 (관리자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async updateCouponTemplate(
    @Param('id') id: string,
    @Body() updateCouponReqDto: UpdateCouponReqDto,
  ) {
    return this.couponTemplatesService.updateCouponTemplate(
      id,
      updateCouponReqDto,
    );
  }

  // 5. 쿠폰 템플릿 삭제 (관리자)
  // DELETE : localhost:3000/coupon-templates/:template_id
  @Delete(':id')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '쿠폰 템플릿 삭제 (관리자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async removeCouponTemplate(@Param('id') id: string) {
    return this.couponTemplatesService.removeCouponTemplate(id);
  }

  // 6. 쿠폰 발급 시작일부터 쿠폰 발급 마감일 사이에 생성된 쿠폰 템플릿 조회하기 (관리자)
  // GET : localhost:3000/coupon-templates/date-range?page=1&size=10&start_date=2023-01-01&end_date=2023-12-31
  @Get('date-range')
  @Usertype(UserType.ADMIN)
  @ApiOperation({
    summary: '쿠폰 발급일기준 기간조회 (관리자)',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiQuery({
    name: 'start_date',
    required: true,
    description: '쿠폰 발급 시작일',
  })
  @ApiQuery({
    name: 'end_date',
    required: true,
    description: '쿠폰 발급 마감일',
  })
  @ApiResponse({ status: 200, description: '성공' })
  async findCouponTemplatesByDateRange(
    @Query() { page, size }: PageReqDto,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    const dateReqDto: DateReqDto = {
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    };

    return this.couponTemplatesService.findCouponTemplatesByDateRange(
      page,
      size,
      dateReqDto,
    );
  }

  // 7. 쿠폰 템플릿 단일 입력조회 - 쿠폰코드조회 또는 회원이름조회 (관리자)
  // GET : localhost:3000/coupon-templates/:template_id?page=1&size=20&criteria=code&code=ABC123
  // GET : localhost:3000/coupon-templates/:template_id?page=1&size=20&criteria=username&username=Jake
  @Get(':template_id')
  @Usertype(UserType.ADMIN)
  @ApiOperation({
    summary: '쿠폰코드 또는 회원이름으로 필터링 후 검색 조회 (관리자)',
  })
  @ApiQuery({
    name: 'criteria',
    enum: ['code', 'username'],
    required: true,
    description: '쿠폰코드로 조회할것인지 회원이름으로 조회할것인지 선택',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiQuery({ name: 'code', required: false, description: '쿠폰 코드' })
  @ApiQuery({ name: 'username', required: false, description: '회원 이름' })
  @ApiResponse({ status: 200, description: '성공' })
  async findCouponTemplateById(
    @Param('template_id') templateId: string,
    @Query() { page, size }: PageReqDto,
    @Query('criteria') criteria: 'code' | 'username',
    @Query('code') code?: string,
    @Query('username') username?: string,
  ) {
    const findCouponReqDto1 = new FindCouponReqDto1();
    findCouponReqDto1.criteria = criteria;
    findCouponReqDto1.code = code;
    findCouponReqDto1.username = username;

    return this.couponTemplatesService.findCouponTemplateById(
      templateId,
      findCouponReqDto1,
      page,
      size,
    );
  }

  // 8. 쿠폰 템플릿 단일조회 (상세조회) - 전체조회 or 사용쿠폰조회 or 미사용쿠폰조회 (관리자)
  // GET : localhost:3000/coupon-templates/:template_id/coupons?page=1&size=20&criteria=all
  @Get(':template_id/coupons')
  @Usertype(UserType.ADMIN)
  @ApiOperation({
    summary:
      '쿠폰 템플릿 단일조회 - 전체, 사용쿠폰, 미사용쿠폰 필터조회 (관리자)',
  })
  @ApiQuery({
    name: 'criteria',
    enum: ['all', 'used', 'unused'],
    required: true,
    description:
      '하나의 쿠폰 템플릿에 있는 쿠폰들을 전체조회할 것인지 사용쿠폰만 조회할것인지 미사용쿠폰만 조회할것인지 선택',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({ status: 200, description: '성공' })
  async findCouponsByTemplateId(
    @Param('template_id') templateId: string,
    @Query() { page, size }: PageReqDto,
    @Query('criteria') criteria: 'all' | 'used' | 'unused',
  ) {
    const findCouponReqDto2 = new FindCouponReqDto2();
    findCouponReqDto2.criteria = criteria;

    return this.couponTemplatesService.findCouponsByTemplateId(
      templateId,
      findCouponReqDto2,
      page,
      size,
    );
  }

  // 9. 단일 쿠폰 삭제 (관리자)
  // DELETE : localhost:3000/coupon-templates/:templateId/coupons/:couponId
  @Delete(':templateId/coupons/:couponId')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '단일 쿠폰 삭제 (관리자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async removeCoupon(
    @Param('templateId') templateId: string,
    @Param('couponId') couponId: string,
  ) {
    return this.couponTemplatesService.removeCoupon(templateId, couponId);
  }

  // 10. 쿠폰 상세정보 조회 (관리자)
  // GET : localhost:3000/coupon-templates/:templateId/coupons/:couponId
  @Get(':templateId/coupons/:couponId')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '단일 쿠폰 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '성공', type: FindCouponResDto })
  async findCoupon(
    @Param('templateId') templateId: string,
    @Param('couponId') couponId: string,
  ): Promise<FindCouponResDto> {
    const coupon = await this.couponService.findCoupon(templateId, couponId);
    if (!coupon) {
      throw new NotFoundException('해당 쿠폰이 존재하지 않습니다.');
    }
    return coupon;
  }
}
