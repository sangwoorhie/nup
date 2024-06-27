import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { AiModel } from './ai_model.entity';
import { Coupon } from './coupon.entity';
import { PaymentType, ChargeType } from '../enums/enums';

@Entity('Payment_records')
export class PaymentRecord {
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

  //
  @Column({ type: 'varchar', length: 255 })
  account_holder_name: string;

  @Column({ type: 'varchar', length: 255 })
  ip: string;

  @Column({ type: 'int' })
  point: number;

  @Column({ type: 'date' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.payment_records)
  user: User;

  @ManyToOne(() => AiModel, (aiModel) => aiModel.payment_records)
  detect_model: AiModel;

  @ManyToOne(() => Coupon, (coupon) => coupon.payment_records)
  coupon: Coupon;
}
