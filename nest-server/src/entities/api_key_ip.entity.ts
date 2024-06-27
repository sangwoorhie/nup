import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('Api_keys')
export class ApiKeyIp {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.api_keys)
  user: User;

  @Column({ type: 'varchar', length: 255 })
  api_key: string;

  @Column({ type: 'varchar', length: 255 })
  ips: string;

  @Column({ type: 'date' })
  created_at: Date;

  @Column({ type: 'date' })
  updated_at: Date;
}
