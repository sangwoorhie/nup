import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRecordsService } from './payment_records.service';

describe('PaymentRecordsService', () => {
  let service: PaymentRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentRecordsService],
    }).compile();

    service = module.get<PaymentRecordsService>(PaymentRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
