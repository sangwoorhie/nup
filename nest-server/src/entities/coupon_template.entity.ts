import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Coupon } from './coupon.entity';
import { ApiProperty } from '@nestjs/swagger';

// 쿠폰 (관리자(발행인)의 입장)
@Entity({ name: 'Coupon_Template' })
export class CouponTemplate {
  // 기본 ID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 쿠폰명
  @ApiProperty({ description: '쿠폰명' })
  @Column({ type: 'varchar' })
  coupon_name: string;

  // 쿠폰 발행수량
  @ApiProperty({ description: '쿠폰 발행수량' })
  @Column({ type: 'int' })
  quantity: number;

  // 쿠폰 포인트
  @ApiProperty({ description: '쿠폰 포인트' })
  @Column({ type: 'int' })
  point: number;

  // 쿠폰 만료 시각
  @ApiProperty({ description: '쿠폰 만료시각' })
  @Column({ type: 'timestamp' })
  expiration_date: Date;

  // 쿠폰 생성 시각
  @ApiProperty({ description: '쿠폰 생성시각' })
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // 쿠폰 수정 시각
  @ApiProperty({ description: '쿠폰 수정시각' })
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // CouponTemplate : User = N : 1 관계
  @ApiProperty({ description: '회원' })
  @ManyToOne(() => User, (user) => user.coupon_templates)
  user: User;

  // CouponTemplate : Coupon = 1 : N 관계
  @ApiProperty({ description: '쿠폰' })
  @OneToMany(() => Coupon, (coupons) => coupons.coupon_template, {
    cascade: true,
  })
  coupons: Coupon[];
}
