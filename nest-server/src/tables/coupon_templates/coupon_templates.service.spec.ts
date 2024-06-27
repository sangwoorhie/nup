import { Test, TestingModule } from '@nestjs/testing';
import { CouponTemplatesService } from './coupon_templates.service';

describe('CouponTemplatesService', () => {
  let service: CouponTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponTemplatesService],
    }).compile();

    service = module.get<CouponTemplatesService>(CouponTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
