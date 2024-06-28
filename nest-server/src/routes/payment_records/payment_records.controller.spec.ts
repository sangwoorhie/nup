import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRecordsController } from './payment_records.controller';
import { PaymentRecordsService } from './payment_records.service';

describe('PaymentRecordsController', () => {
  let controller: PaymentRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentRecordsController],
      providers: [PaymentRecordsService],
    }).compile();

    controller = module.get<PaymentRecordsController>(PaymentRecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
