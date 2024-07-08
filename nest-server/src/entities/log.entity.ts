import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

// 사용자 로그
@Entity({ name: 'Log' })
export class Log {
  // 기본 ID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 유저 접속 일시
  @ApiProperty({ description: '유저 접속 일시' })
  @CreateDateColumn({ type: 'timestamp' })
  loginTimestamp: Date;

  // IP 주소
  @ApiProperty({ description: 'IP 주소' })
  @Column({ type: 'varchar' })
  ip: string;

  // USER-AGENT 값
  @ApiProperty({ description: 'USER-AGENT 값' })
  @Column({ type: 'varchar' })
  userAgent: string;

  // User : Log = N : 1 관계
  @ApiProperty({ description: '유저' })
  @ManyToOne(() => User, (user) => user.logs)
  user: User;
}
