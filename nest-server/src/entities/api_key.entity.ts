import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

// 사용자 API Key
@Entity({ name: 'Api_keys' })
export class ApiKeys {
  // 기본 ID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 발급된 API Key
  @ApiProperty({ description: 'API Key' })
  @Column({ type: 'varchar' })
  api_key: string;

  // 발급된 API Key의 IP주소 ( 0개여도 되고, 단수도 되고, 콤마로 구분하여 복수여도 됨.)
  @ApiProperty({ description: '발급된 API Key의 IP주소' })
  @Column({ type: 'varchar' })
  ips: string;

  // IP 주소의 활성화 상태 (활성/정지)
  @ApiProperty({ description: 'API Key의 활성화 상태 (활성/정지)' })
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // 생성 시각
  @ApiProperty({ description: '생성 시각' })
  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  // 수정 시각
  @ApiProperty({ description: '수정 시각' })
  @UpdateDateColumn({ type: 'date' })
  updated_at: Date;

  // ApiKeys : User = N : 1 관계
  @ApiProperty({ description: '회원' })
  @ManyToOne(() => User, (user) => user.api_keys)
  user: User;
}
