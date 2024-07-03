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
  UpdateCouponReqDto,
} from './dto/req.dto';
import { CreateCouponResDto } from './dto/res.dto';
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Usertype } from 'src/decorators/usertype.decorators';
import { UserType } from 'src/enums/enums';
import { CouponTemplate } from 'src/entities/coupon_template.entity';

@ApiTags('Coupon_Template')
@ApiExtraModels() // DTO들 입력
@Controller('coupon-templates')
export class CouponTemplatesController {
  constructor(
    private readonly couponTemplatesService: CouponTemplatesService,
  ) {}

  // 모든 API는 관리자만 가능

  // 1. 쿠폰 템플릿 생성
  // GET : localhost:3000/coupon-templates
  @Post()
  @ApiOperation({ summary: '쿠폰 템플릿 생성' })
  @ApiResponse({ status: 200, description: '성공', type: CreateCouponResDto })
  @Usertype(UserType.ADMIN)
  async createCouponTemplate(@Body() createCouponReqDto: CreateCouponReqDto) {
    return this.couponTemplatesService.createCouponTemplate(createCouponReqDto);
  }

  // 2. 쿠폰 템플릿 전체조회 (목록조회)
  @Get()
  @ApiOperation({ summary: '쿠폰 템플릿 전체조회' })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async findAllCouponTemplates() {
    return this.couponTemplatesService.findAllCouponTemplates();
  }

  // 3. 쿠폰 템플릿 발행수량 추가
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

  // 4. 쿠폰 템플릿 삭제
  @Delete(':id')
  @ApiOperation({ summary: '쿠폰 템플릿 삭제' })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async removeCouponTemplate(@Param('id') id: string) {
    return this.couponTemplatesService.removeCouponTemplate(id);
  }

  // 5. 쿠폰 만료시각(유효일자)가 지난 쿠폰 탬플릿만 조회하기
  @Get('expired')
  @ApiOperation({
    summary: '쿠폰 만료시각(유효일자)가 지난 쿠폰 탬플릿만 조회',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async findExpiredCouponTemplates() {
    return this.couponTemplatesService.findExpiredCouponTemplates();
  }

  // 6. 쿠폰 만료시각(유효일자)가 아직 지나지 않은 쿠폰 템플릿만 조회하기
  @Get('non-expired')
  @ApiOperation({
    summary: '쿠폰 만료시각(유효일자)가 아직 지나지 않은 쿠폰 템플릿만 조회',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async findNonExpiredCouponTemplates() {
    return this.couponTemplatesService.findNonExpiredCouponTemplates();
  }

  // 7. 쿠폰 발급 시작일부터 쿠폰 발급 마감일 사이에 생성된 쿠폰 템플릿 조회하기
  @Get('date-range')
  @ApiOperation({
    summary: '쿠폰 발급일기준 기간조회',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async findCouponTemplatesByDateRange(@Query() dateReqDto: DateReqDto) {
    return this.couponTemplatesService.findCouponTemplatesByDateRange(
      dateReqDto,
    );
  }

  // 8. 쿠폰 템플릿 단일조회 (상세조회)
  @Get(':id')
  @ApiOperation({
    summary: '쿠폰 템플릿 단일조회 (상세조회)',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @Usertype(UserType.ADMIN)
  async findCouponTemplateById(@Param('id') id: string) {
    return this.couponTemplatesService.findCouponTemplateById(id);
  }
}
