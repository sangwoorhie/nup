import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

// 사업자 정보
@Entity({ name: 'Corporates' })
export class Corporate {
  // 기본 ID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 기업명
  @ApiProperty({ description: '기업 명' })
  @Column({ type: 'varchar', length: 255 })
  corporate_name: string;

  // 업종 코드
  @ApiProperty({ description: '업종 코드' })
  @Column({ type: 'int' })
  industry_code: number;

  // 업종 명
  @ApiProperty({ description: '업종 명' })
  @Column({ type: 'varchar', length: 255 })
  business_type: string;

  // 업태 명
  @ApiProperty({ description: '업태 명' })
  @Column({ type: 'varchar', length: 255 })
  business_conditions: string;

  // 사업자 등록번호
  @ApiProperty({ description: '사업자 등록번호' })
  @Column({ type: 'int' })
  business_registration_number: number;

  // 사업자등록증 사본
  @ApiProperty({ description: '사업자 등록증 사본' })
  @Column({ type: 'varchar', length: 255 })
  business_license: string;

  // 사업자등록증 관리자 확인여부
  @ApiProperty({ description: '사업자등록증 관리자 확인여부' })
  @Column({ type: 'boolean', default: false })
  business_license_verified: boolean;

  // 주소
  @ApiProperty({ description: '주소' })
  @Column({ type: 'bigint' })
  address: string;

  // 사업자 생성 시각
  @ApiProperty({ description: '사업자 생성시각' })
  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  // 사업자 정보수정 시각
  @ApiProperty({ description: '사업자 정보수정 시각' })
  @UpdateDateColumn({ type: 'date' })
  updated_at: Date;

  // Corporate : User = 1 : 1 관계
  @ApiProperty({ description: '회원' })
  @OneToOne(() => User, (user) => user.corporate)
  user: User;
}
