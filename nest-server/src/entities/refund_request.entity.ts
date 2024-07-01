import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

// 환불 신청
@Entity({ name: 'Refund_request' })
export class RefundRequest {
  // 기본 ID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 환불 요청 포인트
  @ApiProperty({ description: '환불신청 포인트' })
  @Column({ type: 'int' })
  requested_point: number;

  // 환불신청 후 잔여포인트
  @ApiProperty({ description: '환불신청 후 포인트' })
  @Column({ type: 'int' })
  rest_point: number;

  // 계좌주 성명
  @ApiProperty({ description: '계좌주 성명' })
  @Column({ type: 'varchar', length: 255 })
  account_holder_name: string;

  // 통장 사본
  @ApiProperty({ description: '통장 사본' })
  @Column({ type: 'varchar', length: 255 })
  bank_account_copy: string;

  // 환불 신청 시각
  @ApiProperty({ description: '환불 신청 시각' })
  @CreateDateColumn({ type: 'date' })
  requested_at: Date;

  // 환불신청 취소 시각
  @ApiProperty({ description: '환불 신청 취소 시각' })
  @DeleteDateColumn({ type: 'date' })
  cancelled_at: Date;

  // RefundRequest : User = N : 1 관계
  @ApiProperty({ description: '회원' })
  @ManyToOne(() => User, (user) => user.refund_requests)
  user: User;
}
