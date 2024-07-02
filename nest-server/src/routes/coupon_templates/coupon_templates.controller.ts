import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CouponTemplatesService } from './coupon_templates.service';
import { CreateCouponReqDto } from './dto/req.dto';
import { CreateCouponResDto } from './dto/res.dto';

@Controller('coupon-templates')
export class CouponTemplatesController {
  constructor(
    private readonly couponTemplatesService: CouponTemplatesService,
  ) {}

  @Post()
  create(@Body() createCouponTemplateDto: CreateCouponReqDto) {
    return this.couponTemplatesService.create(createCouponTemplateDto);
  }

  @Get()
  findAll() {
    return this.couponTemplatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponTemplatesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCouponTemplateDto: CreateCouponResDto,
  ) {
    return this.couponTemplatesService.update(+id, updateCouponTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponTemplatesService.remove(+id);
  }
}
