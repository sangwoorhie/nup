import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Log' })
export class Log {
  // 기본 ID
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
