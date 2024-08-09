import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { CouponTemplate } from './coupon_template.entity';
import { PaymentRecord } from './payment_record.entity';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

// 쿠폰 (사용자의 입장)
@Entity({ name: 'Coupons' })
export class Coupon {
  // 기본 ID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 쿠폰 코드
  @ApiProperty({ description: '쿠폰 코드' })
  @Column({ type: 'varchar' })
  code: string;

  // 쿠폰 사용여부
  @ApiProperty({ description: '쿠폰 사용여부' })
  @Column({ type: 'boolean', default: false })
  is_used: boolean;

  // 쿠폰 사용시각 (쿠폰을 사용한 경우)
  @ApiProperty({ description: '쿠폰 사용시각' })
  @Column({ type: 'timestamp', nullable: true })
  used_at: Date;

  // 쿠폰 생성 시각
  @ApiProperty({ description: '쿠폰 생성 시각' })
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // 쿠폰 수정 시각
  @ApiProperty({ description: '쿠폰 수정 시각' })
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // 쿠폰 삭제시각
  @ApiProperty({ description: '쿠폰 삭제시각' })
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // Coupon : CouponTemplate = N : 1 관계
  @ApiProperty({ description: '쿠폰 템플릿' })
  @ManyToOne(
    () => CouponTemplate,
    (coupon_template) => coupon_template.coupons,
    {
      onDelete: 'CASCADE',
    },
  )
  coupon_template: CouponTemplate;

  // Coupon : User = N : 1 관계
  @ApiProperty({ description: '회원' })
  @ManyToOne(() => User, (user) => user.coupons)
  user: User;

  // Coupon : PaymentRecord = 1 : N 관계
  @ApiProperty({ description: '과금 내역' })
  @OneToMany(() => PaymentRecord, (payment_records) => payment_records.coupons)
  payment_records: PaymentRecord[];
}
