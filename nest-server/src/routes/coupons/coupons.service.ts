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

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
        throw new NotFoundException(`Coupon with code ${code} not found`);
      }

      if (coupon.is_used) {
        throw new BadRequestException('Coupon already used');
      }

      if (new Date() > coupon.coupon_template.expiration_date) {
        throw new BadRequestException('Coupon expired');
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      user.point += coupon.coupon_template.point;
      coupon.is_used = true;
      coupon.used_at = new Date();
      coupon.user = user;

      await queryRunner.manager.save(User, user);
      await queryRunner.manager.save(Coupon, coupon);

      await queryRunner.commitTransaction();

      return {
        coupon_name: coupon.coupon_template.coupon_name,
        code: coupon.code,
        point: coupon.coupon_template.point,
        expiration_date: coupon.coupon_template.expiration_date,
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
  async removeCoupon(id: string): Promise<void> {
    const coupon = await this.couponRepository.findOne({ where: { id } });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    await this.couponRepository.remove(coupon);
  }
}
