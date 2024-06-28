import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { ApiLog } from './api_log.entity';
import { ApiKeyIp } from './api_key_ip.entity';

// 사용자 API Key
@Entity('Api_keys')
export class ApiKeys {
  // 기본 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 발급된 API Key
  @Column({ type: 'varchar', length: 255 })
  api_key: string;

  // 발급된 API Key의 IP주소 ( 0개여도 되고, 단수도 되고, 콤마로 구분하여 복수여도 됨.)
  @Column({ type: 'varchar', length: 255 })
  ips: string;

  // 생성 시각
  @Column({ type: 'date' })
  created_at: Date;

  // 수정 시각
  @Column({ type: 'date' })
  updated_at: Date;

  // ApiKeys : User = N : 1 관계
  @ManyToOne(() => User, (user) => user.api_keys)
  user: User;

  // ApiKeys : ApiLog  = 1 : N 관계
  @OneToMany(() => ApiLog, (api_logs) => api_logs.api_keys)
  api_logs: ApiLog[];

  // ApiKeys : ApiKeyIp  = 1 : N 관계
  @OneToMany(() => ApiKeyIp, (api_key_ips) => api_key_ips.api_keys)
  api_key_ips: ApiKeyIp[];
}
