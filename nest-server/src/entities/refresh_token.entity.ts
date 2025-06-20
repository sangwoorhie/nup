import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

// Auth
@Entity({ name: 'Refresh_token' })
export class RefreshToken {
  // 기본 ID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 토큰 값
  @ApiProperty({ description: '토큰 값' })
  @Column({ type: 'varchar' })
  token: string;

  // 토큰 생성 시각
  @ApiProperty({ description: '토큰 생성시각' })
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // 토큰 업데이트 시각
  @ApiProperty({ description: '토큰 업데이트 시각' })
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // RefreshToken : User = 1 : 1 관계
  @ApiProperty({ description: '회원' })
  @OneToOne(() => User, (user) => user.refresh_tokens)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
