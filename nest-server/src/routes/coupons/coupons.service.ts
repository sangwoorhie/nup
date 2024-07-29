import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from 'src/entities/coupon.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { ApplyCouponReqDto } from './dto/req.dto';
import {
  ApplyCouponResDto,
  CouponDetailsResDto,
  CouponListResDto,
} from './dto/res.dto';
import { PageResDto } from 'src/common/dto/res.dto';
import { PaymentRecord } from 'src/entities/payment_record.entity';
import { ChargeStatus, ChargeType, PaymentType } from 'src/enums/enums';
import { FindCouponResDto } from '../coupon_templates/dto/res.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PaymentRecord)
    private readonly paymentRecordRepository: Repository<PaymentRecord>,
    private readonly dataSource: DataSource,
  ) {}

  // 1. 쿠폰 코드 조회
  async getCouponDetails(code: string): Promise<CouponDetailsResDto> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: ['coupon_template'],
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }

    const { coupon_template } = coupon;

    return {
      coupon_name: coupon_template.coupon_name,
      code: coupon.code,
      point: coupon_template.point,
      expiration_date: coupon_template.expiration_date,
    };
  }

  // 2. 쿠폰 코드 적용
  async applyCoupon(userId: string, code: string): Promise<ApplyCouponResDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const coupon = await queryRunner.manager.findOne(Coupon, {
        where: { code },
        relations: ['coupon_template', 'user'],
      });

      if (!coupon) {
        throw new NotFoundException(`쿠폰 코드: ${code} 가 존재하지 않습니다.`);
      }

      if (coupon.is_used) {
        throw new BadRequestException('이미 사용된 쿠폰입니다.');
      }

      if (new Date() > coupon.coupon_template.expiration_date) {
        const formattedExpirationDate =
          coupon.coupon_template.expiration_date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
        throw new BadRequestException(
          `만료된 쿠폰입니다. 만료일 : ${formattedExpirationDate}`,
        );
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(
          `유저 ID : ${userId} 를 조회할 수 없습니다.`,
        );
      }

      // 유저 포인트 업데이트
      user.point += coupon.coupon_template.point;
      coupon.is_used = true;
      coupon.used_at = new Date();
      coupon.user = user;

      // PaymentRecord 생성
      const paymentRecord = new PaymentRecord();
      paymentRecord.payment_type = PaymentType.CHARGE;
      paymentRecord.charge_status = ChargeStatus.CONFIRMED;
      paymentRecord.charge_type = ChargeType.COUPON;
      paymentRecord.point = coupon.coupon_template.point;
      paymentRecord.user_point = user.point;
      paymentRecord.user = user;
      paymentRecord.coupons = coupon;

      await queryRunner.manager.save(User, user);
      await queryRunner.manager.save(Coupon, coupon);
      await queryRunner.manager.save(PaymentRecord, paymentRecord);

      await queryRunner.commitTransaction();

      return {
        coupon_name: coupon.coupon_template.coupon_name,
        code: coupon.code,
        point: coupon.coupon_template.point,
        expiration_date: coupon.coupon_template.expiration_date,
        used_at: coupon.used_at,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 3. 사용된 쿠폰 목록 조회
  async getUsedCoupons(
    page: number,
    size: number,
  ): Promise<PageResDto<CouponListResDto>> {
    const [coupons, total] = await this.couponRepository.findAndCount({
      where: { is_used: true },
      relations: ['coupon_template'],
      skip: (page - 1) * size,
      take: size,
    });

    const items = coupons.map((coupon) => ({
      coupon_name: coupon.coupon_template.coupon_name,
      code: coupon.code,
      point: coupon.coupon_template.point,
      used_at: coupon.used_at,
      expiration_date: coupon.coupon_template.expiration_date,
    }));

    return {
      page,
      size,
      total,
      items,
    };
  }

  // 4. 단일 쿠폰 삭제
  async removeCoupon(id: string, userId: string): Promise<{ message: string }> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
      relations: ['user', 'payment_records'],
    });

    if (!coupon) {
      throw new NotFoundException(`쿠폰 ID : ${id} 를 조회할 수 없습니다.`);
    }

    if (!coupon.user || coupon.user.id !== userId) {
      throw new BadRequestException('본인이 사용한 쿠폰만 삭제할 수 있습니다.');
    }

    // 결제 기록의 쿠폰 관계 제거
    await this.paymentRecordRepository.update(
      { coupons: coupon },
      { coupons: null },
    );

    // 쿠폰 삭제
    await this.couponRepository.remove(coupon);
    return { message: `쿠폰 ID : ${id}가 성공적으로 삭제되었습니다.` };
  }

  // 5. 쿠폰 상세정보 조회 (관리자)
  async findCoupon(
    templateId: string,
    couponId: string,
  ): Promise<FindCouponResDto> {
    const coupon = await this.couponRepository.findOne({
      where: { id: couponId, coupon_template: { id: templateId } },
      relations: ['user'],
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    const result = new FindCouponResDto();
    result.id = coupon.id;
    result.code = coupon.code;
    result.is_used = coupon.is_used;
    result.used_at = coupon.used_at ? coupon.used_at.toISOString() : null;
    result.username = coupon.user ? coupon.user.username : null;
    result.email = coupon.user ? coupon.user.email : null;

    return result;
  }
}
