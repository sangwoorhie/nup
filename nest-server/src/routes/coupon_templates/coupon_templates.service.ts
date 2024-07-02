import { Injectable } from '@nestjs/common';
import { CreateCouponReqDto } from './dto/req.dto';
import { CreateCouponResDto } from './dto/res.dto';

@Injectable()
export class CouponTemplatesService {
  create(createCouponTemplateDto: CreateCouponReqDto) {
    return 'This action adds a new couponTemplate';
  }

  findAll() {
    return `This action returns all couponTemplates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} couponTemplate`;
  }

  update(id: number, updateCouponTemplateDto: CreateCouponResDto) {
    return `This action updates a #${id} couponTemplate`;
  }

  remove(id: number) {
    return `This action removes a #${id} couponTemplate`;
  }
}
