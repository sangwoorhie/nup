import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiKeys } from './api_key.entity';

// API 요청 로그 (API 사용자의 경우)
@Entity('Api_logs')
export class ApiLog {
  // 기본 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 요청 IP 주소
  @Column({ type: 'varchar', length: 255 })
  requested_ip: string;

  // 호출된 엔드포인트 주소
  @Column({ type: 'varchar', length: 255 })
  endpoint: string;

  // HTTP 매서드 (GET, POST 등)
  @Column({ type: 'bigint' })
  method: number;

  // 응답 상태코드
  @Column({ type: 'bigint' })
  status_code: number;

  // 사용된 토큰 수
  @Column({ type: 'bigint' })
  tokens_used: number;

  // 요청 시각
  @Column({ type: 'date' })
  created_at: Date;

  // ApiLog : ApiKeys = N : 1 관계
  @ManyToOne(() => ApiKeys, (api_keys) => api_keys.api_logs)
  api_keys: ApiKeys[];
}
