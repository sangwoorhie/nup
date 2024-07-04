import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { AiModel } from './ai_model.entity';
import { Coupon } from './coupon.entity';
import { PaymentType, ChargeType } from '../enums/enums';
import { ApiProperty } from '@nestjs/swagger';

// 과금 내역 (포인트 충전 또는 사용)
@Entity({ name: 'Payment_records' })
export class PaymentRecord {
  // 기본 ID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 거래유형 (포인트충전/ 포인트사용)
  @ApiProperty({ description: '거래유형 (포인트충전/ 포인트사용)' })
  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.CHARGE,
  })
  payment_type: PaymentType;

  // 충전유형(카드,현금,페이팔,쿠폰)
  @ApiProperty({ description: '충전유형 (카드,현금,페이팔,쿠폰)' })
  @Column({
    type: 'enum',
    enum: ChargeType,
    default: ChargeType.CARD,
  })
  charge_type: ChargeType;

  // 계좌주 이름
  @ApiProperty({ description: '계좌주 이름' })
  @Column({ type: 'varchar' })
  account_holder_name: string;

  // 거래 포인트 (충전은 양수, 사용은 음수)
  @ApiProperty({ description: '거래 포인트' })
  @Column({ type: 'int' })
  point: number;

  // 유저 포인트
  @ApiProperty({ description: '유저의 포인트' })
  @Column({ type: 'int' })
  user_point: number;

  // 거래 발생시각
  @ApiProperty({ description: '거래 발생시각' })
  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  // PaymentRecord : User = N : 1 관계
  @ApiProperty({ description: '회원' })
  @ManyToOne(() => User, (user) => user.payment_records)
  user: User;

  // PaymentRecord : AiModel = N : 1 관계
  @ApiProperty({ description: 'AI 모델' })
  @ManyToOne(() => AiModel, (ai_models) => ai_models.payment_records)
  ai_models: AiModel;

  // PaymentRecord : Coupon = N : 1 관계
  @ApiProperty({ description: '쿠폰' })
  @ManyToOne(() => Coupon, (coupons) => coupons.payment_records)
  coupons: Coupon;
}
