import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('Coupon_Template')
export class CouponTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.coupon_templates)
  user: User;

  @Column({ type: 'bigint' })
  name: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'bigint' })
  point: number;

  @Column({ type: 'date' })
  expiration_date: Date;

  @Column({ type: 'date' })
  created_at: Date;

  @Column({ type: 'date' })
  updated_at: Date;
}
