import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('Corporates')
export class Corporate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.corporates)
  user: User;

  @Column({ type: 'varchar', length: 255 })
  corporate_name: string;

  @Column({ type: 'int' })
  industry_code: number;

  @Column({ type: 'varchar', length: 255 })
  business_type: string;

  @Column({ type: 'varchar', length: 255 })
  business_conditions: string;

  @Column({ type: 'int' })
  business_registration_number: number;

  @Column({ type: 'varchar', length: 255 })
  business_license: string;

  @Column({ type: 'bigint' })
  address: number;
}
