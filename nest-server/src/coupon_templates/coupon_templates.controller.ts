import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CouponTemplatesService } from './coupon_templates.service';
import { CreateCouponTemplateDto } from './dto/create-coupon_template.dto';
import { UpdateCouponTemplateDto } from './dto/update-coupon_template.dto';

@Controller('coupon-templates')
export class CouponTemplatesController {
  constructor(private readonly couponTemplatesService: CouponTemplatesService) {}

  @Post()
  create(@Body() createCouponTemplateDto: CreateCouponTemplateDto) {
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
  update(@Param('id') id: string, @Body() updateCouponTemplateDto: UpdateCouponTemplateDto) {
    return this.couponTemplatesService.update(+id, updateCouponTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponTemplatesService.remove(+id);
  }
}
