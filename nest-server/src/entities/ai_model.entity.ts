import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PaymentRecord } from './payment_record.entity';
import { Image } from './image.entity';
import { ModelType } from 'src/enums/enums';
import { ApiProperty } from '@nestjs/swagger';

// AI Detect 모델
@Entity({ name: 'Ai_models' })
export class AiModel {
  // 기본 ID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 모델 타입
  @ApiProperty({ description: '모델 타입' })
  @Column({
    type: 'enum',
    enum: ModelType,
    default: ModelType.NIGHTLY,
  })
  model_type: ModelType;

  // 모델 버전
  @ApiProperty({ description: '모델 버전' })
  @Column({ type: 'varchar' })
  version: string;

  // 모델 경로
  @ApiProperty({ description: '모델 경로' })
  @Column({ type: 'varchar' })
  file_path: string;

  // 생성 시각
  @ApiProperty({ description: '생성 시각' })
  @Column({ type: 'date' })
  created_at: Date;

  // 수정 시각
  @ApiProperty({ description: '수정 시각' })
  @Column({ type: 'date' })
  updated_at: Date;

  // AiModel : PaymentRecord = 1 : N 관계
  @ApiProperty({ description: '과금 내역' })
  @OneToMany(
    () => PaymentRecord,
    (payment_records) => payment_records.ai_models,
  )
  payment_records: PaymentRecord[];

  // AiModel : Image = 1 : N 관계
  @ApiProperty({ description: '조사 이미지' })
  @OneToMany(() => Image, (images) => images.ai_models)
  images: Image[];
}
