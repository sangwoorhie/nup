import { Injectable } from '@nestjs/common';
import { CreateCouponTemplateDto } from './dto/create-coupon_template.dto';
import { UpdateCouponTemplateDto } from './dto/update-coupon_template.dto';

@Injectable()
export class CouponTemplatesService {
  create(createCouponTemplateDto: CreateCouponTemplateDto) {
    return 'This action adds a new couponTemplate';
  }

  findAll() {
    return `This action returns all couponTemplates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} couponTemplate`;
  }

  update(id: number, updateCouponTemplateDto: UpdateCouponTemplateDto) {
    return `This action updates a #${id} couponTemplate`;
  }

  remove(id: number) {
    return `This action removes a #${id} couponTemplate`;
  }
}
