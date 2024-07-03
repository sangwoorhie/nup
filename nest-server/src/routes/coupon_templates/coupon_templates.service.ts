import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateCouponReqDto,
  DateReqDto,
  UpdateCouponReqDto,
} from './dto/req.dto';
import { CreateCouponResDto } from './dto/res.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponTemplate } from 'src/entities/coupon_template.entity';
import { Between, DeepPartial, LessThan, MoreThan, Repository } from 'typeorm';
import { Coupon } from 'src/entities/coupon.entity';

@Injectable()
export class CouponTemplatesService {
  constructor(
    @InjectRepository(CouponTemplate)
    private readonly couponTemplateRepository: Repository<CouponTemplate>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  // 1. 쿠폰 템플릿 생성
  async createCouponTemplate(
    createCouponReqDto: CreateCouponReqDto,
  ): Promise<CreateCouponResDto> {
    const { coupon_name, quantity, point, expiration_date } =
      createCouponReqDto;
    if (!coupon_name || !quantity || !point || !expiration_date) {
      throw new BadRequestException('모든 내용을 입력해주세요.');
    }
    const couponTemplate =
      this.couponTemplateRepository.create(createCouponReqDto);
    await this.couponTemplateRepository.save(couponTemplate);

    const couponCodes = generateMultipleCouponCodes(quantity);
    const coupons = couponCodes.map((code) => {
      return this.couponRepository.create({
        code,
        expiration_date,
        point,
        coupon_template: couponTemplate,
      } as DeepPartial<Coupon>); // 여기서 타입 지정
    });
    await this.couponRepository.save(coupons);

    return {
      ...couponTemplate,
      quantity: createCouponReqDto.quantity,
    };
  }

  // 2. 쿠폰 템플릿 전체조회 (목록조회)
  async findAllCouponTemplates(): Promise<CouponTemplate[]> {
    return this.couponTemplateRepository.find();
  }

  // 3. 쿠폰 템플릿 발행수량 추가
  async updateCouponTemplate(
    id: string,
    updateCouponReqDto: UpdateCouponReqDto,
  ): Promise<CouponTemplate> {
    const couponTemplate = await this.couponTemplateRepository.findOne({
      where: { id },
    });
    if (!couponTemplate) {
      throw new NotFoundException(`CouponTemplate with ID ${id} not found`);
    }

    const additionalQuantity = updateCouponReqDto.quantity;
    const newTotalQuantity = couponTemplate.quantity + additionalQuantity;

    const couponCodes = generateMultipleCouponCodes(additionalQuantity);
    const coupons = couponCodes.map((code) => {
      return this.couponRepository.create({
        code,
        expiration_date: couponTemplate.expiration_date,
        point: couponTemplate.point,
        coupon_template: couponTemplate,
      } as DeepPartial<Coupon>);
    });
    await this.couponRepository.save(coupons);

    couponTemplate.quantity = newTotalQuantity;
    return this.couponTemplateRepository.save(couponTemplate);
  }

  // 4. 쿠폰 템플릿 삭제
  async removeCouponTemplate(id: string): Promise<void> {
    const couponTemplate = await this.couponTemplateRepository.findOne({
      where: { id },
    });
    if (!couponTemplate) {
      throw new NotFoundException(`CouponTemplate with ID ${id} not found`);
    }

    await this.couponTemplateRepository.remove(couponTemplate);
  }

  // 5. 쿠폰 만료시각(유효일자)가 지난 쿠폰 탬플릿만 조회하기
  async findExpiredCouponTemplates(): Promise<CouponTemplate[]> {
    return this.couponTemplateRepository.find({
      where: {
        expiration_date: LessThan(new Date()),
      },
    });
  }

  // 6. 쿠폰 만료시각(유효일자)가 아직 지나지 않은 쿠폰 템플릿만 조회하기
  async findNonExpiredCouponTemplates(): Promise<CouponTemplate[]> {
    return this.couponTemplateRepository.find({
      where: {
        expiration_date: MoreThan(new Date()),
      },
    });
  }

  // 7. 쿠폰 발급 시작일부터 쿠폰 발급 마감일 사이에 생성된 쿠폰 템플릿 조회하기
  async findCouponTemplatesByDateRange(
    dateReqDto: DateReqDto,
  ): Promise<CouponTemplate[]> {
    return this.couponTemplateRepository.find({
      where: {
        created_at: Between(dateReqDto.start_date, dateReqDto.end_date),
      },
    });
  }

  // 8. 쿠폰 템플릿 단일조회 (상세조회)
  async findCouponTemplateById(id: string): Promise<CouponTemplate> {
    const couponTemplate = await this.couponTemplateRepository.findOne({
      where: { id },
      relations: ['coupons', 'coupons.user'],
    });
    if (!couponTemplate) {
      throw new NotFoundException(`CouponTemplate with ID ${id} not found`);
    }

    return couponTemplate;
  }
}
