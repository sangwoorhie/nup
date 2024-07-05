import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChargeType, PaymentType } from 'src/enums/enums';
import { PaymentRecord } from 'src/entities/payment_record.entity';
import { User } from 'src/entities/user.entity';
import { AdminChargeDto, CreateChargeDto } from './dto/req.dto';

@Injectable()
export class PaymentRecordsService {
  constructor(
    @InjectRepository(PaymentRecord)
    private paymentRecordRepository: Repository<PaymentRecord>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 1. 포인트 충전 (사용자)
  async createCharge(createChargeDto: CreateChargeDto): Promise<PaymentRecord> {
    const user = await this.userRepository.findOne({
      where: { id: createChargeDto.userId },
    });
    if (!user) throw new Error('User not found');

    const newCharge = this.paymentRecordRepository.create({
      ...createChargeDto,
      user,
      payment_type: PaymentType.CHARGE,
      charge_type: ChargeType.CASH,
      point: createChargeDto.amount,
      user_point: user.point + createChargeDto.amount,
    });

    user.point += createChargeDto.amount;
    await this.userRepository.save(user);
    return this.paymentRecordRepository.save(newCharge);
  }

  // 2. 포인트 충전 요청 목록 조회 (관리자)
  async getPendingCharges(): Promise<PaymentRecord[]> {
    return this.paymentRecordRepository.find({
      where: { payment_type: PaymentType.CHARGE, charge_type: ChargeType.CASH },
      relations: ['user'],
    });
  }

  // 3. 포인트 충전 처리 (관리자)
  async confirmCharge(
    id: string,
    adminChargeDto: AdminChargeDto,
  ): Promise<PaymentRecord> {
    const charge = await this.paymentRecordRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!charge) throw new Error('Charge not found');

    charge.user_point += charge.point;
    await this.userRepository.save(charge.user);
    charge.charge_status = adminChargeDto.status;
    return this.paymentRecordRepository.save(charge);
  }
}
