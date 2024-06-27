import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Coupon } from './coupon.entity';
import { PaymentRecord } from './payment_record.entity';
import { RefreshToken } from './refresh_token.entity';
import { RefundRequest } from './refund_request.entity';
import { Corporate } from './corporate.entity';
import { ApiKeyIp } from './api_key.entity';
import { Image } from './image.entity';
import { UserType1, UserType2, UserType3 } from './../enums/enums';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // 회원유형1 (일반회원/관리자회원)
  @Column({
    type: 'enum',
    enum: UserType1,
    default: UserType1.NORMAL,
  })
  user_type_1: UserType1;

  // 회원유형2 (개인회원/사업자회원)
  @Column({
    type: 'enum',
    enum: UserType2,
    default: UserType2.INDIVIDUAL,
  })
  user_type_2: UserType2;

  // 회원유형3 (WEB회원/API회원)
  @Column({
    type: 'enum',
    enum: UserType3,
    default: UserType3.WEB,
  })
  user_type_3: UserType3;

  // 이메일
  @Column({ type: 'varchar', length: 255 })
  email: string;

  // 비밀번호
  @Column({ type: 'varchar', length: 255 })
  password: string;

  // 회원 이름
  @Column({ type: 'varchar', length: 255 })
  username: string;

  // 연락처
  @Column({ type: 'int' })
  phone: number;

  // 비상연락처
  @Column({ type: 'int' })
  emergency_phone: number;

  // 포인트
  @Column({ type: 'int' })
  point: number;

  // 프로필 이미지
  @Column({ type: 'varchar', length: 255 })
  profile_image: string;

  // 부서 (사업자회원만 해당)
  @Column({ type: 'varchar', length: 255 })
  department: string;

  // 직책 (사업자회원만 해당)
  @Column({ type: 'varchar', length: 255 })
  position: string;

  // 계정정지 여부
  @Column({ type: 'boolean', default: false })
  banned: boolean;

  @Column({ type: 'date' })
  created_at: Date;

  @Column({ type: 'date' })
  updated_at: Date;

  @Column({ type: 'date' })
  deleted_at: Date;

  // User : Corporate = 1 : 1 관계
  @OneToOne(() => Corporate, (corporate) => corporate.user)
  corporates: Corporate;

  // User : RefreshToken = 1 : 1 관계
  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refresh_tokens: RefreshToken;

  // User : Coupon = 1 : N 관계
  @OneToMany(() => Coupon, (coupon) => coupon.user)
  coupons: Coupon[];

  // User : PaymentRecord = 1 : N 관계
  @OneToMany(() => PaymentRecord, (paymentRecord) => paymentRecord.user)
  payment_records: PaymentRecord[];

  // User : RefundRequest = 1 : N 관계
  @OneToMany(() => RefundRequest, (refundRequest) => refundRequest.user)
  refund_requests: RefundRequest[];

  // User : ApiKeyIp = 1 : N 관계
  @OneToMany(() => ApiKeyIp, (apiKey) => apiKey.user)
  api_keys: ApiKeyIp[];

  // User : Image = 1 : N 관계
  @OneToMany(() => Image, (image) => image.user)
  images: Image[];
}
