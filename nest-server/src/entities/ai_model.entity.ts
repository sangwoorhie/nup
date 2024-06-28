import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PaymentRecord } from './payment_record.entity';
import { Image } from './image.entity';
import { ModelType } from 'src/enums/enums';

// AI Detect 모델
@Entity('Ai_models')
export class AiModel {
  // 기본 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 모델 타입
  @Column({
    type: 'enum',
    enum: ModelType,
    default: ModelType.NIGHTLY,
  })
  model_type: ModelType;

  // 모델 버전
  @Column({ type: 'varchar', length: 255 })
  version: string;

  // 모델 경로
  @Column({ type: 'varchar', length: 255 })
  file_path: string;

  // 생성 시각
  @Column({ type: 'date' })
  created_at: Date;

  // 수정 시각
  @Column({ type: 'date' })
  updated_at: Date;

  // AiModel : PaymentRecord = 1 : N 관계
  @OneToMany(
    () => PaymentRecord,
    (payment_records) => payment_records.ai_models,
  )
  payment_records: PaymentRecord[];

  // AiModel : Image = 1 : N 관계
  @OneToMany(() => Image, (images) => images.ai_models)
  images: Image[];
}
