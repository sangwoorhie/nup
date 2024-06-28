import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { User } from './user.entity';

// 사업자 정보
@Entity('Corporates')
export class Corporate {
  // 기본 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 기업명
  @Column({ type: 'varchar', length: 255 })
  corporate_name: string;

  // 업종 코드
  @Column({ type: 'int' })
  industry_code: number;

  // 업종 명
  @Column({ type: 'varchar', length: 255 })
  business_type: string;

  // 업태 명
  @Column({ type: 'varchar', length: 255 })
  business_conditions: string;

  // 사업자 등록번호
  @Column({ type: 'int' })
  business_registration_number: number;

  // 사업자등록증 사본
  @Column({ type: 'varchar', length: 255 })
  business_license: string;

  // 주소
  @Column({ type: 'bigint' })
  address: number;

  // Corporate : User = 1 : 1 관계
  @OneToOne(() => User, (user) => user.corporates)
  user: User;
}
