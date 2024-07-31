import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, IsNull, MoreThan, Repository } from 'typeorm';
import {
  ChargeStatus,
  ChargeType,
  PaymentType,
  UserType,
} from 'src/enums/enums';
import { PaymentRecord } from 'src/entities/payment_record.entity';
import { User } from 'src/entities/user.entity';
import {
  AdminChargeDto,
  CreateChargeReqDto,
  DateReqDto,
  DeleteRecordsDto,
} from './dto/req.dto';
import { PageReqDto } from 'src/common/dto/req.dto';
import { PageResDto } from 'src/common/dto/res.dto';
import {
  AdminChargeResDto,
  ChargeResAdminDto,
  ChargeResDto,
} from './dto/res.dto';
import { createTransporter } from 'src/config/mailer.config';
import * as moment from 'moment-timezone';
import { format } from 'date-fns';

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
  async createCharge(
    createChargeReqDto: CreateChargeReqDto,
    userId: string,
  ): Promise<void> {
    // Change the return type to void
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('해당 회원이 존재하지 않습니다.');
    }

    const { amount, account_holder_name } = createChargeReqDto;

    const now = moment().tz('Asia/Seoul');
    const formattedDate = now.format('YYYY-MM-DD HH:mm');

    const newCharge = this.paymentRecordRepository.create({
      payment_type: PaymentType.CHARGE,
      charge_type: ChargeType.CASH,
      point: amount,
      account_holder_name: account_holder_name,
      user_point: user.point, // 요청 시점에서는 증가하지 않음
      user: user,
      charge_status: ChargeStatus.PENDING,
      created_at: formattedDate,
    });

    await this.paymentRecordRepository.save(newCharge);

    // Send email notification
    const transporter = createTransporter();
    const depositDeadline = now.add(2, 'days').format('YYYY.MM.DD 23:59');
    const formattedAmount = amount.toLocaleString('en-US');

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: '[KO-MAPPER] 현금 충전 안내',
      html: `
        <p>안녕하세요, ${user.username} 고객님,</p>
        <p>KO-MAPPER AI 서비스를 현금 충전을 선택해 주셔서 감사합니다. 입금 기한에 맞추어, 아래 계좌 정보로 입금해 주시기 바랍니다.</p>
        <ul>
          <li>은행명: 신한은행</li>
          <li>계좌번호: 123-456-789012</li>
          <li>예금주: (주)코매퍼</li>
        </ul>
        <p>입금 금액: ${formattedAmount}원</p>
        <p>입금 기한: ${depositDeadline}</p>
        <p>입금 확인 후 영업일 기준 최대 1-2일 이내에 포인트가 적립될 예정입니다.</p>
        <p>감사합니다. (주)코매퍼 드림</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  }

  // 2. 본인 포인트 충전 내역 조회 (사용자)
  async getCharge(
    page: number,
    size: number,
    userId: string,
  ): Promise<PageResDto<ChargeResDto>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const [items, total] = await this.paymentRecordRepository.findAndCount({
      where: {
        payment_type: PaymentType.CHARGE,
        point: MoreThan(0),
        user: { id: userId },
        deleted_at: IsNull(),
      },
      skip: (page - 1) * size,
      take: size,
      order: {
        created_at: 'DESC',
      },
    });

    const mappedItems = items.map((item) => {
      if (item.charge_type === ChargeType.COUPON) {
        item.charge_status = ChargeStatus.CONFIRMED;
      }
      const amount = item.charge_type === ChargeType.COUPON ? 0 : item.point;
      return {
        id: item.id,
        charge_type: item.charge_type,
        charge_status: item.charge_status,
        amount: amount,
        point: item.point,
        user_point: user.point,
        created_at: moment(item.created_at)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm'),
      };
    });

    return {
      page,
      size,
      total,
      items: mappedItems,
    };
  }

  // 3. 본인 포인트 거래내역 삭제 (사용자)
  async deleteCharge(id: string, userId: string) {
    const record = await this.paymentRecordRepository.findOne({
      where: { id, user: { id: userId }, deleted_at: IsNull() },
    });

    if (!record) {
      throw new BadRequestException('해당 충전 내역을 찾을 수 없습니다.');
    }

    if (record.charge_status === ChargeStatus.PENDING) {
      throw new BadRequestException(
        '현재 충전상태가 진행중이므로 삭제할 수 없습니다.',
      );
    }

    record.deleted_at = new Date();
    await this.paymentRecordRepository.save(record);

    return { message: '충전 내역이 삭제되었습니다.' };
  }

  // 4. 포인트 충전 요청 목록 조회 (관리자)
  async getPendingCharges(
    page: number,
    size: number,
  ): Promise<PageResDto<AdminChargeResDto>> {
    const [items, total] = await this.paymentRecordRepository.findAndCount({
      where: {
        // 조회 조건
        payment_type: PaymentType.CHARGE, // 충전의 경우만
        // charge_status: ChargeStatus.PENDING, // pending 상태만
        charge_type: ChargeType.CASH, // 현금충전의 경우만
        // deleted_at: IsNull(),
      },
      relations: ['user', 'user.corporate'],
      skip: (page - 1) * size,
      take: size,
      order: { created_at: 'DESC' },
    });

    const mappedItems = items.map((item) => {
      const isCorporate = item.user.user_type === UserType.CORPORATE;
      return {
        id: item.id,
        charge_type: item.charge_type,
        account_holder_name: item.account_holder_name,
        point: item.point,
        user_point: item.user_point,
        charge_status: item.charge_status,
        created_at: item.created_at,
        username: isCorporate
          ? item.user.corporate.corporate_name
          : item.user.username,
        phone: item.user.phone,
        email: item.user.email,
      };
    });

    return {
      page,
      size,
      total,
      items: mappedItems,
    };
  }

  // 5. 포인트 충전 요청 목록 날짜별 조회 (관리자)
  async findChargeRequestByDateRange(
    page: number,
    size: number,
    dateReqDto: DateReqDto,
  ): Promise<PageResDto<AdminChargeResDto>> {
    const startDate = new Date(dateReqDto.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateReqDto.end_date);
    endDate.setHours(23, 59, 59, 999);

    const [items, total] = await this.paymentRecordRepository.findAndCount({
      where: {
        payment_type: PaymentType.CHARGE,
        charge_type: ChargeType.CASH,
        created_at: Between(startDate, endDate),
      },
      relations: ['user', 'user.corporate'],
      skip: (page - 1) * size,
      take: size,
      order: { created_at: 'DESC' },
    });

    const mappedItems = items.map((item) => {
      const isCorporate = item.user.user_type === UserType.CORPORATE;
      return {
        id: item.id,
        charge_type: item.charge_type,
        account_holder_name: item.account_holder_name,
        point: item.point,
        user_point: item.user_point,
        charge_status: item.charge_status,
        created_at: item.created_at,
        username: isCorporate
          ? item.user.corporate.corporate_name
          : item.user.username,
        phone: item.user.phone,
        email: item.user.email,
      };
    });

    return {
      page,
      size,
      total,
      items: mappedItems,
    };
  }

  // 6. 포인트 충전 처리 (관리자)
  async confirmCharges(
    adminChargeDtos: AdminChargeDto[],
  ): Promise<PaymentRecord[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    const charges = [];

    try {
      for (const adminChargeDto of adminChargeDtos) {
        const { id, status } = adminChargeDto;
        const charge = await queryRunner.manager.findOne(PaymentRecord, {
          where: { id, deleted_at: IsNull() },
          relations: ['user'],
        });

        if (!charge) throw new Error(`Charge with ID ${id} not found`);
        if (charge.charge_status === ChargeStatus.CONFIRMED)
          throw new Error('이미 충전 완료 처리 된 요청 건입니다.');
        if (charge.charge_status === ChargeStatus.REJECTED)
          throw new Error('이미 반려 처리 된 요청 건입니다.');
        charge.charge_status = status;

        if (charge.charge_status === ChargeStatus.CONFIRMED) {
          charge.user.point += charge.point;
          charge.user_point = charge.user.point;
          await queryRunner.manager.save(charge.user);
        }

        await queryRunner.manager.save(charge);
        charges.push(charge);
      }

      await queryRunner.commitTransaction();
      return charges;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  // 7. 충전요청내역 삭제처리 (관리자)
  async deleteRecords(deleteRecordsDto: DeleteRecordsDto) {
    const { ids } = deleteRecordsDto;

    const records = await this.paymentRecordRepository.find({
      where: { id: In(ids), deleted_at: IsNull() },
    });

    if (records.length === 0) {
      throw new BadRequestException('삭제할 요청내역을 선택해 주세요.');
    }

    const now = new Date();
    records.forEach((record) => (record.deleted_at = now));

    await this.paymentRecordRepository.save(records);

    return {
      message: `${records.length} records have been successfully deleted.`,
    };
  }

  // 8.회원 충전요청내역 조회 (관리자)
  async getUserChargeRequest(
    userId: string,
    page: number,
    size: number,
  ): Promise<PageResDto<ChargeResAdminDto>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const username = user.username;

    const [items, total] = await this.paymentRecordRepository.findAndCount({
      where: {
        payment_type: PaymentType.CHARGE,
        user: { id: userId },
        deleted_at: IsNull(),
      },
      skip: (page - 1) * size,
      take: size,
      order: {
        created_at: 'DESC',
      },
    });

    const mappedItems = items.map((item) => {
      const amount = item.point;
      return {
        id: item.id,
        username: username,
        charge_type: item.charge_type,
        charge_status: item.charge_status,
        amount: amount,
        point: item.point,
        user_point: item.user_point,
        created_at: moment(item.created_at)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm'),
      };
    });

    return {
      page,
      size,
      total,
      items: mappedItems,
    };
  }
}
