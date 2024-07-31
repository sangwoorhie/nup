import { PageResDto } from 'src/common/dto/res.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateCouponReqDto,
  DateReqDto,
  FindCouponReqDto1,
  FindCouponReqDto2,
  FindCouponTemplateReqDto,
  UpdateCouponReqDto,
} from './dto/req.dto';
import {
  CreateCouponResDto,
  FindCouponResDto,
  FindCouponTemplateResDto,
  FindOneCouponTemplateResDto,
} from './dto/res.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponTemplate } from 'src/entities/coupon_template.entity';
import {
  Between,
  DataSource,
  DeepPartial,
  FindOperator,
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm';
import { Coupon } from 'src/entities/coupon.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class CouponTemplatesService {
  constructor(
    @InjectRepository(CouponTemplate)
    private readonly couponTemplateRepository: Repository<CouponTemplate>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  // 1. 쿠폰 템플릿 생성
  async createCouponTemplate(
    createCouponReqDto: CreateCouponReqDto,
    userId: string,
  ): Promise<CreateCouponResDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { coupon_name, quantity, point, expiration_date } =
        createCouponReqDto;
      if (!coupon_name || !quantity || !point || !expiration_date) {
        throw new BadRequestException('모든 내용을 입력해주세요.');
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      const couponTemplate = queryRunner.manager.create(CouponTemplate, {
        ...createCouponReqDto,
        user,
      });
      await queryRunner.manager.save(couponTemplate);

      const couponCodes = this.generateMultipleCouponCodes(quantity);
      const coupons = couponCodes.map((code) => {
        return queryRunner.manager.create(Coupon, {
          code,
          expiration_date,
          point,
          coupon_template: couponTemplate,
        } as DeepPartial<Coupon>);
      });
      await queryRunner.manager.save(coupons);

      await queryRunner.commitTransaction();

      return {
        ...couponTemplate,
        quantity: createCouponReqDto.quantity,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 랜덤 코드 생성
  private generateRandomCouponCode(): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const segments = [4, 4, 4, 4, 4, 4, 4];
    let couponCode = '';

    segments.forEach((segmentLength, index) => {
      for (let i = 0; i < segmentLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        couponCode += characters[randomIndex];
      }
      if (index < segments.length - 1) {
        couponCode += '-';
      }
    });

    return couponCode;
  }

  private generateMultipleCouponCodes(count: number): string[] {
    const couponCodes: string[] = [];
    for (let i = 0; i < count; i++) {
      couponCodes.push(this.generateRandomCouponCode());
    }
    return couponCodes;
  }

  // 2. 쿠폰 템플릿 전체조회
  async findCouponTemplates(
    findCouponTemplateReqDto: FindCouponTemplateReqDto,
    page: number,
    size: number,
  ): Promise<PageResDto<FindCouponTemplateResDto>> {
    let whereCondition: { expiration_date?: FindOperator<Date> };

    const { criteria } = findCouponTemplateReqDto;

    if (criteria === 'non-expired') {
      whereCondition = {
        expiration_date: MoreThan(new Date()),
      };
    } else if (criteria === 'expired') {
      whereCondition = {
        expiration_date: LessThan(new Date()),
      };
    } else {
      whereCondition = {};
    }

    const [couponTemplates, total] =
      await this.couponTemplateRepository.findAndCount({
        where: whereCondition,
        relations: ['user'],
        skip: (page - 1) * size,
        take: size,
        order: { created_at: 'DESC' },
      });

    const items = couponTemplates.map((template) => ({
      id: template.id,
      coupon_name: template.coupon_name,
      quantity: template.quantity,
      point: template.point,
      created_at: template.created_at,
      expiration_date: template.expiration_date,
      username: template.user ? template.user.username : '',
    }));

    return {
      page,
      size,
      total,
      items,
    };
  }

  // 3. 쿠폰명으로 쿠폰 템플릿 조회
  async findCouponTemplateByName(
    coupon_name: string,
  ): Promise<FindOneCouponTemplateResDto[]> {
    const couponTemplates = await this.couponTemplateRepository.find({
      where: { coupon_name },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
    return couponTemplates.map((couponTemplate) => ({
      id: couponTemplate.id,
      coupon_name: couponTemplate.coupon_name,
      quantity: couponTemplate.quantity,
      point: couponTemplate.point,
      created_at: couponTemplate.created_at,
      expiration_date: couponTemplate.expiration_date,
      username: couponTemplate.user ? couponTemplate.user.username : '',
    }));
  }

  // 4. 쿠폰 템플릿 발행수량 추가
  async updateCouponTemplate(
    id: string,
    updateCouponReqDto: UpdateCouponReqDto,
  ): Promise<CouponTemplate> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const couponTemplate = await queryRunner.manager.findOne(CouponTemplate, {
        where: { id },
      });
      if (!couponTemplate) {
        throw new NotFoundException(`CouponTemplate with ID ${id} not found`);
      }

      const additionalQuantity = updateCouponReqDto.quantity;
      const newTotalQuantity = couponTemplate.quantity + additionalQuantity;

      const couponCodes = this.generateMultipleCouponCodes(additionalQuantity);
      const coupons = couponCodes.map((code) => {
        return queryRunner.manager.create(Coupon, {
          code,
          expiration_date: couponTemplate.expiration_date,
          point: couponTemplate.point,
          coupon_template: couponTemplate,
        } as DeepPartial<Coupon>);
      });
      await queryRunner.manager.save(coupons);

      couponTemplate.quantity = newTotalQuantity;
      await queryRunner.manager.save(couponTemplate);

      await queryRunner.commitTransaction();

      return couponTemplate;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 5. 쿠폰 템플릿 삭제
  async removeCouponTemplate(id: string): Promise<{ message: string }> {
    const couponTemplate = await this.couponTemplateRepository.findOne({
      where: { id },
    });
    if (!couponTemplate) {
      throw new NotFoundException(`쿠폰 템플릿 ID : ${id}를 찾을 수 없습니다.`);
    }
    await this.couponTemplateRepository.remove(couponTemplate);

    return { message: `쿠폰 템플릿 ID : ${id}가 성공적으로 삭제되었습니다.` };
  }

  // 6. 쿠폰 발급 시작일부터 쿠폰 발급 마감일 사이에 생성된 쿠폰 템플릿 조회하기
  async findCouponTemplatesByDateRange(
    page: number,
    size: number,
    dateReqDto: DateReqDto,
  ): Promise<PageResDto<FindCouponTemplateResDto>> {
    const startDate = new Date(dateReqDto.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateReqDto.end_date);
    endDate.setHours(23, 59, 59, 999);

    const [couponTemplates, total] =
      await this.couponTemplateRepository.findAndCount({
        where: {
          created_at: Between(startDate, endDate),
        },
        skip: (page - 1) * size,
        take: size,
        order: { created_at: 'DESC' },
      });

    const items = couponTemplates.map((template) => ({
      id: template.id,
      coupon_name: template.coupon_name,
      quantity: template.quantity,
      point: template.point,
      created_at: template.created_at,
      expiration_date: template.expiration_date,
    }));

    return {
      page,
      size,
      total,
      items,
    };
  }

  // 7. 쿠폰 템플릿 단일조회 - 쿠폰코드 또는 회원이름으로 조회 (관리자)
  async findCouponTemplateById(
    id: string,
    findCouponReqDto1: FindCouponReqDto1,
    page: number,
    size: number,
  ): Promise<PageResDto<FindCouponResDto>> {
    const { criteria, code, username } = findCouponReqDto1;

    let whereCondition: any = { coupon_template: { id } };

    if (criteria === 'code' && code) {
      whereCondition = { ...whereCondition, code };
    } else if (criteria === 'username' && username) {
      whereCondition = { ...whereCondition, user: { username } };
    } else {
      throw new BadRequestException('Invalid criteria or value');
    }

    const [coupons, total] = await this.couponRepository.findAndCount({
      where: whereCondition,
      relations: ['user'],
      skip: (page - 1) * size,
      take: size,
      withDeleted: true, // Include soft-deleted records
    });

    const items = coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      is_used: coupon.is_used,
      used_at: coupon.used_at ? coupon.used_at.toISOString() : null,
      // used_at: coupon.used_at instanceof Date ? coupon.used_at.toISOString() : null,
      username: coupon.user ? coupon.user.username : null,
      email: coupon.user ? coupon.user.email : null,
      // deleted_at: coupon.deleted_at ? coupon.deleted_at.toISOString() : null, // Add deleted_at field
    }));

    return {
      page,
      size,
      total,
      items,
    };
  }

  // 8. 쿠폰 템플릿 단일조회 (상세조회) - 전체, 사용쿠폰, 미사용쿠폰 조회 (관리자)
  async findCouponsByTemplateId(
    id: string,
    findCouponReqDto2: FindCouponReqDto2,
    page: number,
    size: number,
  ): Promise<PageResDto<FindCouponResDto>> {
    const { criteria } = findCouponReqDto2;

    let whereCondition: {
      coupon_template: { id: string };
      is_used?: boolean;
    };

    if (criteria === 'used') {
      whereCondition = { coupon_template: { id }, is_used: true };
    } else if (criteria === 'unused') {
      whereCondition = { coupon_template: { id }, is_used: false };
    } else {
      whereCondition = { coupon_template: { id } };
    }

    const [coupons, total] = await this.couponRepository.findAndCount({
      where: whereCondition,
      relations: ['user'],
      skip: (page - 1) * size,
      take: size,
      withDeleted: true, // Include soft-deleted records
    });

    const items = coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      is_used: coupon.is_used,
      used_at: coupon.used_at ? coupon.used_at.toISOString() : null,
      // used_at: coupon.used_at instanceof Date ? coupon.used_at.toISOString() : null,
      username: coupon.user ? coupon.user.username : null,
      email: coupon.user ? coupon.user.email : null,
      // deleted_at: coupon.deleted_at ? coupon.deleted_at.toISOString() : null, // Add deleted_at field
    }));

    return {
      page,
      size,
      total,
      items,
    };
  }

  // 9. 단일 쿠폰 삭제 (관리자)
  async removeCoupon(
    templateId: string,
    couponId: string,
  ): Promise<{ message: string }> {
    const couponTemplate = await this.couponTemplateRepository.findOne({
      where: { id: templateId },
    });
    if (!couponTemplate) {
      throw new NotFoundException(
        `쿠폰 템플릿 ID : ${templateId}를 찾을 수 없습니다.`,
      );
    }

    const coupon = await this.couponRepository.findOne({
      where: { id: couponId, coupon_template: { id: templateId } },
    });
    if (!coupon) {
      throw new NotFoundException(`쿠폰 ID ${couponId} 를 찾을 수 없습니다.`);
    }

    await this.couponRepository.remove(coupon);
    return { message: `쿠폰 ID : ${couponId}가 성공적으로 삭제되었습니다.` };
  }
}
