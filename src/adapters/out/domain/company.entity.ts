import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './user.entity';

@Entity('company')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 18, unique: true })
  cnpj: string;

  @Column({ type: 'varchar', name: 'institution_name', length: 100 })
  institutionName: string;

  @Column({ type: 'varchar', length: 15 })
  cnes: string;

  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_user_id' })
  user: Users;
}
