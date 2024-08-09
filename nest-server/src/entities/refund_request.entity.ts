import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
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
  @Column({ type: 'varchar', nullable: true })
  account_holder_name: string;

  // 통장 사본
  @ApiProperty({ description: '통장 사본' })
  @Column({ type: 'varchar' })
  bank_account_copy: string;

  // 환불신청 사유
  @ApiProperty({ description: ' 환불신청 사유' })
  @Column({ type: 'varchar' })
  refund_request_reason: string;

  // 환불신청 완료 여부
  @ApiProperty({ description: '환불신청 완료 여부' })
  @Column({ type: 'boolean', default: false })
  is_refunded: boolean;

  // 환불 취소 여부
  @ApiProperty({ description: '환불 취소 여부' })
  @Column({ type: 'boolean', default: false })
  is_cancelled: boolean;

  // 환불 신청 시각
  @ApiProperty({ description: '환불 신청 시각' })
  @CreateDateColumn({ type: 'timestamp' })
  requested_at: Date;

  // 환불신청 취소 시각
  @ApiProperty({ description: '환불 신청 취소 시각' })
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  cancelled_at: Date | null;

  // 환불 삭제 시각
  @ApiProperty({ description: '환불 신청 삭제 시각' })
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  // RefundRequest : User = N : 1 관계
  @ApiProperty({ description: '회원' })
  @ManyToOne(() => User, (user) => user.refund_requests)
  user: User;
}
