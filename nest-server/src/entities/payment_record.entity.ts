import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { AiModel } from './ai_model.entity';
import { Coupon } from './coupon.entity';
import { PaymentType, ChargeType } from '../enums/enums';

// 과금 내역 (포인트 충전 또는 사용)
@Entity('Payment_records')
export class PaymentRecord {
  // 기본 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 거래유형 (포인트충전/ 포인트사용)
  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.CHARGE,
  })
  payment_type: PaymentType;

  // 충전유형
  @Column({
    type: 'enum',
    enum: ChargeType,
    default: ChargeType.CARD,
  })
  charge_type: ChargeType;

  // 계좌주 이름
  @Column({ type: 'varchar', length: 255 })
  account_holder_name: string;

  // 거래 포인트 (충전은 양수, 사용은 음수)
  @Column({ type: 'int' })
  point: number;

  // 거래 발생시각
  @Column({ type: 'date' })
  created_at: Date;

  // PaymentRecord : User = N : 1 관계
  @ManyToOne(() => User, (user) => user.payment_records)
  user: User;

  // PaymentRecord : AiModel = N : 1 관계
  @ManyToOne(() => AiModel, (ai_models) => ai_models.payment_records)
  ai_models: AiModel;

  // PaymentRecord : Coupon = N : 1 관계
  @ManyToOne(() => Coupon, (coupons) => coupons.payment_records)
  coupons: Coupon;
}
