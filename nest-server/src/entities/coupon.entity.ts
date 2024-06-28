import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CouponTemplate } from './coupon_template.entity';
import { PaymentRecord } from './payment_record.entity';
import { User } from './user.entity';

// 쿠폰 (사용자의 입장)
@Entity('Coupons')
export class Coupon {
  // 기본 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 쿠폰 코드
  @Column({ type: 'varchar', length: 255 })
  code: string;

  // 쿠폰 사용여부
  @Column({ type: 'boolean', default: false })
  is_used: boolean;

  // 쿠폰 사용시각 (쿠폰을 사용한 경우)
  @Column({ type: 'date' })
  used_at: Date;

  // 쿠폰 생성 시각
  @Column({ type: 'date' })
  created_at: Date;

  // 쿠폰 수정 시각
  @Column({ type: 'date' })
  updated_at: Date;

  // Coupon : CouponTemplate = N : 1 관계
  @ManyToOne(() => CouponTemplate, (coupon_template) => coupon_template.coupons)
  coupon_template: CouponTemplate;

  // Coupon : User = N : 1 관계
  @ManyToOne(() => User, (user) => user.coupons)
  user: User;

  // Coupon : PaymentRecord = 1 : N 관계
  @OneToMany(() => PaymentRecord, (payment_records) => payment_records.coupons)
  payment_records: PaymentRecord[];
}
