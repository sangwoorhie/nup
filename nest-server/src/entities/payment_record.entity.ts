import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { AiModel } from './ai_model.entity';
import { Coupon } from './coupon.entity';
import { PaymentType, ChargeType, ChargeStatus } from '../enums/enums';
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

  // 계좌주 이름 (현금 충전의 경우)
  @ApiProperty({ description: '계좌주 이름' })
  @Column({ type: 'varchar', nullable: true })
  account_holder_name: string;

  // 거래 포인트 (충전은 양수, 사용은 음수)
  @ApiProperty({ description: '거래 포인트' })
  @Column({ type: 'int' })
  point: number;

  // 유저 포인트
  @ApiProperty({ description: '유저의 포인트' })
  @Column({ type: 'int', nullable: true })
  user_point: number;

  // 디텍팅된 이미지의 갯수
  @ApiProperty({ description: '디텍팅된 이미지의 갯수' })
  @Column({ type: 'int', nullable: true })
  detected_images_count: number;

  // 거래 상태
  @ApiProperty({ description: '거래 상태' })
  @Column({
    type: 'enum',
    enum: ChargeStatus,
    default: ChargeStatus.PENDING,
  })
  charge_status: ChargeStatus;

  // 거래 발생시각
  @ApiProperty({ description: '거래 발생시각' })
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // 거래 삭제시각
  @ApiProperty({ description: '거래 삭제시각' })
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;

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
  @ManyToOne(() => Coupon, (coupons) => coupons.payment_records, {
    onDelete: 'SET NULL',
  })
  coupons: Coupon;
}
