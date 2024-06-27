import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Detect_models')
export class AiModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  model_type: 'nightly' | 'stable';

  @Column({ type: 'varchar', length: 255 })
  version: string;

  @Column({ type: 'varchar', length: 255 })
  file_path: string;

  @Column({ type: 'date' })
  created_at: Date;

  @Column({ type: 'date' })
  updated_at: Date;
}
