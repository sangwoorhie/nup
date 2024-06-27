import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CouponTemplate } from './coupon_template.entity';
import { User } from './user.entity';

@Entity('Coupons')
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CouponTemplate, (couponTemplate) => couponTemplate.coupons)
  coupon_template: CouponTemplate;

  @ManyToOne(() => User, (user) => user.coupons)
  user: User;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'boolean' })
  is_used: boolean;

  @Column({ type: 'date' })
  used_at: Date;

  @Column({ type: 'date' })
  created_at: Date;

  @Column({ type: 'date' })
  updated_at: Date;
}
