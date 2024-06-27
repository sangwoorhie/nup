import { Test, TestingModule } from '@nestjs/testing';
import { CouponTemplatesController } from './coupon_templates.controller';
import { CouponTemplatesService } from './coupon_templates.service';

describe('CouponTemplatesController', () => {
  let controller: CouponTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponTemplatesController],
      providers: [CouponTemplatesService],
    }).compile();

    controller = module.get<CouponTemplatesController>(CouponTemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
