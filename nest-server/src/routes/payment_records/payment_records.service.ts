import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ChargeStatus, ChargeType, PaymentType, UserType } from 'src/enums/enums';
import { PaymentRecord } from 'src/entities/payment_record.entity';
import { User } from 'src/entities/user.entity';
import { AdminChargeDto, CreateChargeReqDto } from './dto/req.dto';
import { PageReqDto } from 'src/common/dto/req.dto';
import { PageResDto } from 'src/common/dto/res.dto';
import { AdminChargeResDto } from './dto/res.dto';

@Injectable()
export class PaymentRecordsService {
  constructor(
    @InjectRepository(PaymentRecord)
    private paymentRecordRepository: Repository<PaymentRecord>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  // 1. 현금결제 포인트 충전 요청 (사용자)
  async createCharge(createChargeReqDto: CreateChargeReqDto, userId: string): Promise<PaymentRecord> {
    const user = await this.userRepository.findOne({ where : { id: userId }});

    const { amount, account_holder_name } = createChargeReqDto

    const newCharge = this.paymentRecordRepository.create({
      payment_type: PaymentType.CHARGE,
      charge_type: ChargeType.CASH,
      point: amount,
      account_holder_name: account_holder_name,
      user_point: user.point,  // 요청 시점에서는 증가하지 않음
      user: user,
      charge_status: ChargeStatus.PENDING,
      created_at: new Date(),
    });

    return this.paymentRecordRepository.save(newCharge);
  }

  // 2. 포인트 충전 요청 목록 조회 (관리자)
  async getPendingCharges(page: number, size: number): Promise<PageResDto<AdminChargeResDto>> {
    const [items, total] = await this.paymentRecordRepository.findAndCount({
      where: { // 조회 조건
        payment_type: PaymentType.CHARGE, // 충전의 경우만
        charge_status: ChargeStatus.PENDING, // pending 상태만
        charge_type: ChargeType.CASH, // 현금충전의 경우만
      },
      relations: ['user', 'user.corporate'],
      skip: (page - 1) * size,
      take: size,
    });
  
    const mappedItems = items.map(item => {
      const isCorporate = item.user.user_type === UserType.CORPORATE;
      return {
        charge_type: item.charge_type,
        account_holder_name: item.account_holder_name,
        point: item.point,
        user_point: item.user_point,
        charge_status: item.charge_status,
        created_at: item.created_at,
        username: isCorporate ? item.user.corporate.corporate_name : item.user.username,
        phone: item.user.phone,
      };
    });
  
    return {
      page,
      size,
      total,
      items: mappedItems,
    };
  }
  
  // 3. 포인트 충전 처리 (관리자)
  async confirmCharge(
    id: string,
    adminChargeDto: AdminChargeDto,
  ): Promise<PaymentRecord> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    try {
      const charge = await queryRunner.manager.findOne(PaymentRecord, {
        where: { id },
        relations: ['user'],
      });

      if (!charge) throw new Error('Charge not found');
      if (charge.charge_status !== ChargeStatus.PENDING) throw new Error('Charge is already processed');
      charge.charge_status = adminChargeDto.status;

      if (charge.charge_status === ChargeStatus.CONFIRMED) {
        charge.user.point += charge.point;
        charge.user_point = charge.user.point;
        await queryRunner.manager.save(charge.user);
      }

      await queryRunner.manager.save(charge);
      await queryRunner.commitTransaction();
      return charge;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }
}