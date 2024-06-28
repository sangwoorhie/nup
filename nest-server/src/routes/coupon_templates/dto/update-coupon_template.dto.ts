import { PartialType } from '@nestjs/mapped-types';
import { CreateCouponTemplateDto } from './create-coupon_template.dto';

export class UpdateCouponTemplateDto extends PartialType(CreateCouponTemplateDto) {}
