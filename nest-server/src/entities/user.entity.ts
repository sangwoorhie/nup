import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Coupon } from './coupon.entity';
import { PaymentRecord } from './payment_record.entity';
import { RefreshToken } from './refresh_token.entity';
import { RefundRequest } from './refund_request.entity';
import { Corporate } from './corporate.entity';
import { ApiKeys } from './api_key.entity';
import { Image } from './image.entity';
import { CouponTemplate } from './coupon_template.entity';
import { UserType } from '../enums/enums';
import { ApiProperty } from '@nestjs/swagger';
import { TokenUsage } from './token_usage.entity';
import { Log } from './log.entity';

// 사용자
@Entity({ name: 'Users' })
export class User {
  // 기본 ID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 회원유형
  @ApiProperty({ description: '회원유형' })
  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.INDIVIDUAL,
  })
  user_type: UserType;

  // 이메일
  @ApiProperty({ description: '이메일' })
  @Column({ type: 'varchar', unique: true })
  email: string;

  // 비밀번호
  @ApiProperty({ description: '비밀번호' })
  @Column({ type: 'varchar', nullable: true })
  password: string;

  // 회원 이름
  @ApiProperty({ description: '회원이름' })
  @Column({ type: 'varchar' })
  username: string;

  // 연락처
  @ApiProperty({ description: '연락처' })
  @Column({ type: 'varchar', nullable: false })
  phone: string;

  // 비상 연락처
  @ApiProperty({ description: '비상 연락처' })
  @Column({ type: 'varchar', nullable: true })
  emergency_phone: string;

  // 포인트
  @ApiProperty({ description: '회원 포인트' })
  @Column({ type: 'int', default: 0 })
  point: number;

  // 프로필 이미지
  @ApiProperty({ description: '프로필 이미지' })
  @Column({ type: 'varchar', nullable: true })
  profile_image: string;

  // 부서 (사업자회원만 해당)
  @ApiProperty({ description: '부서 (사업자회원만 해당)' })
  @Column({ type: 'varchar', nullable: true })
  department: string;

  // 직위 (사업자회원만 해당)
  @ApiProperty({ description: '직위 (사업자회원만 해당)' })
  @Column({ type: 'varchar', nullable: true })
  position: string;

  // 계정정지 여부
  @ApiProperty({ description: '계정정지 여부' })
  @Column({ type: 'boolean', default: false })
  banned: boolean;

  // 계정정지 사유
  @ApiProperty({ description: '계정정지 사유' })
  @Column({ type: 'varchar', nullable: true })
  banned_reason: string;

  // 회원가입 완료 여부 (소셜계정 회원용)
  @ApiProperty({ description: '회원가입 완료 여부 (소셜계정 회원용)' })
  @Column({ type: 'boolean', default: false })
  is_signup_completed: boolean;

  // 유저 생성 시각
  @ApiProperty({ description: '유저 생성시각' })
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // 유저 정보수정 시각
  @ApiProperty({ description: '유저 정보수정 시각' })
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // 유저 삭제 시각
  @ApiProperty({ description: '유저 삭제시각' })
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // User : Corporate = 1 : 1 관계
  @ApiProperty({ description: '사업자 정보' })
  @OneToOne(() => Corporate, (corporate) => corporate.user)
  corporate: Corporate;

  // User : RefreshToken = 1 : 1 관계
  @ApiProperty({ description: '토큰' })
  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refresh_tokens: RefreshToken;

  // User : Coupon = 1 : N 관계
  @ApiProperty({ description: '쿠폰' })
  @OneToMany(() => Coupon, (coupon) => coupon.user)
  coupons: Coupon[];

  // User : PaymentRecord = 1 : N 관계
  @ApiProperty({ description: '거래 내역(과금 내역)' })
  @OneToMany(() => PaymentRecord, (paymentRecord) => paymentRecord.user)
  payment_records: PaymentRecord[];

  // User : RefundRequest = 1 : N 관계
  @ApiProperty({ description: '환불 신청 내역' })
  @OneToMany(() => RefundRequest, (refundRequest) => refundRequest.user)
  refund_requests: RefundRequest[];

  // User : ApiKeyIp = 1 : N 관계
  @ApiProperty({ description: 'API Key IP' })
  @OneToMany(() => ApiKeys, (api_keys) => api_keys.user)
  api_keys: ApiKeys[];

  // User : Image = 1 : N 관계
  @ApiProperty({ description: '조사 이미지' })
  @OneToMany(() => Image, (image) => image.user)
  images: Image[];

  // User : CouponTemplate = 1 : N 관계
  @ApiProperty({ description: '쿠폰 템플릿 (관리자만 해당)' })
  @OneToMany(() => CouponTemplate, (coupon_templates) => coupon_templates.user)
  coupon_templates: CouponTemplate[];

  // User : TokenUsage = 1 : N 관계
  @ApiProperty({ description: '토큰 사용량' })
  @OneToMany(() => TokenUsage, (tokenUsage) => tokenUsage.user)
  tokenUsages: TokenUsage[];

  // User : Log = 1 : N 관계
  @ApiProperty({ description: '접속 기록' })
  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];
}
