import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { User } from './user.entity';

// Auth
@Entity('Refresh_token')
export class RefreshToken {
  // 기본 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 토큰 값
  @Column({ type: 'int' })
  token: number;

  // 토큰 생성일
  @Column({ type: 'date' })
  created_at: Date;

  // 토큰 업데이트 시각
  @Column({ type: 'date' })
  updated_at: Date;

  // RefreshToken : User = 1 : 1 관계
  @OneToOne(() => User, (user) => user.refresh_tokens)
  user: User;
}
