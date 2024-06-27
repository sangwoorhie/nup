import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { AiModel } from './ai_model.entity';

@Entity('Images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.images)
  user: User;

  @ManyToOne(() => AiModel, (aiModel) => aiModel.images)
  detect_model: AiModel;

  @Column({ type: 'varchar', length: 255 })
  ip: string;

  @Column({ type: 'varchar', length: 255 })
  image_path: string;

  @Column({ type: 'varchar', length: 255 })
  status: 'detecting' | 'detected' | 'failed';

  @Column({ type: 'boolean' })
  is_detected: boolean;

  @Column({ type: 'date' })
  created_at: Date;

  @Column({ type: 'bigint' })
  detected_at: number;
}
