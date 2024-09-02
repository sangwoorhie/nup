import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// 이미지 가격 배율 및 삭감금액 설정 (관리자)
@Entity()
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 100 })
  dividingNumber: number;

  @Column({ type: 'int', default: 1000 })
  cuttingOffValue: number;
}
