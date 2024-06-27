import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiKeyIp } from './api_key.entity';

@Entity('Api_key_ip')
export class ApiKeyIp {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ApiKeyIp, (apiKey) => apiKey.api_key_ips)
  api_key: ApiKeyIp;

  @Column({ type: 'varchar', length: 255 })
  ip: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'date' })
  created_at: Date;

  @Column({ type: 'date' })
  updated_at: Date;
}
