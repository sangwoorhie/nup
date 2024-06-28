import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiKeys } from './api_key.entity';
import { ApiProperty } from '@nestjs/swagger';

// API Key에 있는 각각의 개별 IP
@Entity({ name: 'Api_key_ips' })
export class ApiKeyIp {
  // 기본 ID
  @PrimaryGeneratedColumn()
  id: number;

  // IP 주소
  @ApiProperty({ description: 'IP 주소' })
  @Column({ type: 'varchar', length: 255 })
  ip: string;

  // IP 주소의 활성화 상태 (활성/정지)
  @ApiProperty({ description: 'IP 주소의 활성화 상태 (활성/정지)' })
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

  // ApiKeyIp : ApiKeys  = N : 1 관계
  @ApiProperty({ description: 'API Key' })
  @ManyToOne(() => ApiKeys, (api_keys) => api_keys.api_key_ips)
  api_keys: ApiKeys;
}
