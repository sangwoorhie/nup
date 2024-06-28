import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { AiModel } from './ai_model.entity';
import { ImageStatus } from 'src/enums/enums';
import { ApiProperty } from '@nestjs/swagger';

// 조사 이미지
@Entity({ name: 'Images' })
export class Image {
  // 기본 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 이미지 경로
  @ApiProperty({ description: '이미지 경로' })
  @Column({ type: 'varchar', length: 255 })
  image_path: string;

  // 이미지 분석상태
  @ApiProperty({ description: '이미지 분석상태' })
  @Column({
    type: 'enum',
    enum: ImageStatus,
    default: ImageStatus.NOT_DETECTED,
  })
  status: ImageStatus;

  // 분석완료 여부
  @ApiProperty({ description: '분석완료 여부' })
  @Column({ type: 'boolean', default: false })
  is_detected: boolean;

  // 이미지가 업로드 된 시각
  @ApiProperty({ description: '이미지가 업로드(생성) 된 시각' })
  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  // 이미지가 분석된 시각
  @ApiProperty({ description: '이미지가 분석된 시각' })
  @Column({ type: 'date' })
  detected_at: Date;

  // Image : User = N : 1 관계
  @ApiProperty({ description: '회원' })
  @ManyToOne(() => User, (user) => user.images)
  user: User;

  // Image : AiModel = N : 1 관계
  @ApiProperty({ description: 'AI 모델' })
  @ManyToOne(() => AiModel, (ai_models) => ai_models.images)
  ai_models: AiModel;
}
