import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { ApplyCouponReqDto, CouponCodeReqDto } from './dto/req.dto';
import { ApplyCouponResDto, CouponDetailsResDto } from './dto/res.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PageReqDto } from 'src/common/dto/req.dto';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';
import { PageResDto } from 'src/common/dto/res.dto';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // 1. 쿠폰 코드 조회 (사용자)
  // POST : localhost:3000/coupons/coupon-code?code=ABC123
  @Get('coupon-code')
  @ApiOperation({ summary: '쿠폰 코드로 쿠폰 상세 정보 조회 (사용자)' })
  @ApiQuery({ name: 'code', required: true, description: '쿠폰 코드' })
  @ApiResponse({ status: 200, description: '성공', type: CouponDetailsResDto })
  async getCouponDetails(@Query() couponCodeReqDto: CouponCodeReqDto) {
    return await this.couponsService.getCouponDetails(couponCodeReqDto.code);
  }

  // 2. 쿠폰 코드 적용 (조회를 먼저 하고, 적용함) (사용자)
  // POST : localhost:3000/coupons/apply
  @Post('apply')
  @ApiOperation({ summary: '쿠폰 코드 적용 (사용자)' })
  @ApiResponse({ status: 200, description: '성공', type: ApplyCouponResDto })
  async applyCoupon(
    @User() user: UserAfterAuth,
    @Body() applyCouponReqDto: ApplyCouponReqDto,
  ) {
    return await this.couponsService.applyCoupon(
      user.id,
      applyCouponReqDto.code,
    );
  }

  // 3. 사용된 쿠폰 목록 조회 (사용자)
  // GET : localhost:3000/coupons/used?page=1&size=20
  @Get('used')
  @ApiOperation({ summary: '사용된 쿠폰 목록 조회 (사용자)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: PageResDto,
  })
  async getUsedCoupons(@Query() pageReqDto: PageReqDto) {
    return await this.couponsService.getUsedCoupons(
      pageReqDto.page,
      pageReqDto.size,
    );
  }

  // 4. 단일 쿠폰 삭제 (사용자)
  // DELETE : localhost:3000/coupons/:id
  @Delete(':id')
  @ApiOperation({ summary: '단일 쿠폰 삭제 (사용자)' })
  @ApiResponse({ status: 200, description: '성공' })
  async removeCoupon(@Param('id') id: string, @User() user: UserAfterAuth) {
    return await this.couponsService.removeCoupon(id, user.id);
  }
}
