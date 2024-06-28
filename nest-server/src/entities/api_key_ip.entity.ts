import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiKeys } from './api_key.entity';

// API Key에 있는 각각의 개별 IP
@Entity('Api_key_ips')
export class ApiKeyIp {
  // 기본 ID
  @PrimaryGeneratedColumn()
  id: number;

  // IP 주소
  @Column({ type: 'varchar', length: 255 })
  ip: string;

  // IP 주소의 활성화 상태 (활성/정지)
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // 생성 시각
  @Column({ type: 'date' })
  created_at: Date;

  // 수정 시각
  @Column({ type: 'date' })
  updated_at: Date;

  // ApiKeyIp : ApiKeys  = N : 1 관계
  @ManyToOne(() => ApiKeys, (api_keys) => api_keys.api_key_ips)
  api_keys: ApiKeys;
}
