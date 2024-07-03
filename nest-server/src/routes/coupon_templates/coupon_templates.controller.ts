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
import { CreateCouponResDto, FindCouponTemplateResDto } from './dto/res.dto';
import {
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Usertype } from 'src/decorators/usertype.decorators';
import { UserType } from 'src/enums/enums';
import { CouponTemplate } from 'src/entities/coupon_template.entity';
import { PageReqDto } from 'src/common/dto/req.dto';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';

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
  ) {}

  // 1. 쿠폰 템플릿 생성 (관리자)
  // POST : localhost:3000/coupon-templates
  @Post()
  @ApiOperation({ summary: '쿠폰 템플릿 생성' })
  @ApiResponse({ status: 200, description: '성공', type: CreateCouponResDto })
  @Usertype(UserType.ADMIN)
  async createCouponTemplate(
    @User() user: UserAfterAuth,
    @Body() createCouponReqDto: CreateCouponReqDto,
  ) {
    return this.couponTemplatesService.createCouponTemplate(
      createCouponReqDto,
      user.id,
    );
  }

  // 2. 쿠폰 템플릿 조회 (관리자)
  // GET : localhost:3000/coupon-templates?criteria=all&page=1&size=10
  @Get()
  @ApiOperation({ summary: '쿠폰 템플릿 조회' })
  @ApiQuery({ name: 'criteria', required: false, description: '조회 기준' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async findCouponTemplates(
    @Query() { criteria }: FindCouponTemplateReqDto,
    @Query() { page, size }: PageReqDto,
  ) {
    return this.couponTemplatesService.findCouponTemplates(
      criteria,
      page,
      size,
    );
  }

  // 3. 쿠폰명으로 쿠폰 템플릿 조회 (관리자)
  // POST : localhost:3000/coupon-templates/name
  @Post('name')
  @ApiOperation({ summary: '쿠폰명으로 쿠폰 템플릿 조회' })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: [FindCouponTemplateResDto],
  })
  @Usertype(UserType.ADMIN)
  async findCouponTemplateByName(
    @Body() findByCouponNameReqDto: FindByCouponNameReqDto,
  ) {
    return this.couponTemplatesService.findCouponTemplateByName(
      findByCouponNameReqDto.coupon_name,
    );
  }

  // 4. 쿠폰 템플릿 발행수량 추가 (관리자)
  // PATCH : localhost:3000/coupon-templates/:id
  @Patch(':id')
  @ApiOperation({ summary: '쿠폰 템플릿 발행수량 변경' })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
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
  // DELETE : localhost:3000/coupon-templates/:id
  @Delete(':id')
  @ApiOperation({ summary: '쿠폰 템플릿 삭제' })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async removeCouponTemplate(@Param('id') id: string) {
    return this.couponTemplatesService.removeCouponTemplate(id);
  }

  // 6. 쿠폰 발급 시작일부터 쿠폰 발급 마감일 사이에 생성된 쿠폰 템플릿 조회하기 (관리자)
  // GET : localhost:3000/coupon-templates/date-range?page=1&size=10
  @Get('date-range')
  @ApiOperation({
    summary: '쿠폰 발급일기준 기간조회',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async findCouponTemplatesByDateRange(
    @Query() { page, size }: PageReqDto,
    @Query() dateReqDto: DateReqDto,
  ) {
    return this.couponTemplatesService.findCouponTemplatesByDateRange(
      page,
      size,
      dateReqDto,
    );
  }

  // 7. 쿠폰 템플릿 단일조회 (상세조회) - 쿠폰코드조회 또는 회원이름조회 (관리자)
  // GET : localhost:3000/coupon-templates/:id?criteria=code&code=ABC123&page=1&size=10
  @Get(':id')
  @ApiOperation({
    summary: '쿠폰코드 또는 회원이름으로 조회',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async findCouponTemplateById(
    @Param('id') id: string,
    @Query() findCouponReqDto1: FindCouponReqDto1,
  ) {
    return this.couponTemplatesService.findCouponTemplateById(
      id,
      findCouponReqDto1,
    );
  }

  // 8. 쿠폰 템플릿 단일조회 (상세조회) - 전체조회 또는 사용쿠폰조회 또는 미사용쿠폰조회 (관리자)
  // GET : localhost:3000/coupon-templates/:id/coupons?criteria=all&page=1&size=10
  @Get(':id/coupons')
  @ApiOperation({
    summary: '쿠폰 템플릿 단일조회 - 전체, 사용쿠폰, 미사용쿠폰 조회',
  })
  @ApiQuery({ name: 'criteria', required: false, description: '조회 기준' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async findCouponsByTemplateId(
    @Param('id') id: string,
    @Query() findCouponReqDto2: FindCouponReqDto2,
    @Query() { page, size }: PageReqDto,
  ) {
    return this.couponTemplatesService.findCouponsByTemplateId(
      id,
      findCouponReqDto2,
      page,
      size,
    );
  }

  // 9. 단일 쿠폰 삭제 (관리자)
  // DELETE : localhost:3000/coupon-templates/:templateId/coupons/:couponId
  @Delete(':templateId/coupons/:couponId')
  @ApiOperation({ summary: '단일 쿠폰 삭제' })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async removeCoupon(
    @Param('templateId') templateId: string,
    @Param('couponId') couponId: string,
  ) {
    return this.couponTemplatesService.removeCoupon(templateId, couponId);
  }
}
