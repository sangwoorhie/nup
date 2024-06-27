import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiKeyIp } from './api_key.entity';

@Entity('Api_logs')
export class ApiLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ApiKeyIp, (apiKey) => apiKey.api_logs)
  api_key: ApiKeyIp;

  @Column({ type: 'varchar', length: 255 })
  requested_ip: string;

  @Column({ type: 'varchar', length: 255 })
  endpoint: string;

  @Column({ type: 'bigint' })
  method: number;

  @Column({ type: 'bigint' })
  status_code: number;

  @Column({ type: 'bigint' })
  tokens_used: number;

  @Column({ type: 'date' })
  created_at: Date;
}
