import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './user.entity';

@Entity('donor')
export class Donor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 14, nullable: false })
  cpf: string;

  @Column({ type: 'varchar', name: 'blood_type', length: 4, nullable: true })
  bloodType?: string;

  @Column({ type: 'date', name: 'birth_date', nullable: true })
  birthDate?: Date;

  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_user_id' })
  user: Users;
}
