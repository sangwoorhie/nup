import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('Refund_request')
export class RefundRequest {
  @PrimaryGeneratedColumn()
  id: number;

  // 환불 요청 포인트
  @Column({ type: 'int' })
  requested_point: number;

  // 환불신청 후 잔여포인트
  @Column({ type: 'int' })
  rest_point: number;

  // 계좌주 성명
  @Column({ type: 'varchar', length: 255 })
  account_holder_name: string;

  // 통장 사본
  @Column({ type: 'varchar', length: 255 })
  bank_account_copy: string;

  // 환불 신청 날짜
  @Column({ type: 'date' })
  requested_at: Date;

  // 환불신청 취소날짜
  @Column({ type: 'date' })
  cancelled_at: Date;

  // RefundRequest : User = N : 1 관계
  @ManyToOne(() => User, (user) => user.refund_requests)
  user: User;
}
