// token-usage.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

// 토큰 사용량
@Entity({ name: 'TokenUsage' })
export class TokenUsage {
  // 기본 ID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 토큰 사용량
  @ApiProperty({ description: '토큰 사용량' })
  @Column({ type: 'int', default: 0 })
  count: number;

  // 토큰 생성시각
  @ApiProperty({ description: '토큰 생성시각' })
  @CreateDateColumn({ type: 'timestamp' })
  date: Date;

  // TokenUsage : User = N : 1 관계
  @ApiProperty({ description: '회원' })
  @ManyToOne(() => User, (user) => user.tokenUsages)
  user: User;
}
