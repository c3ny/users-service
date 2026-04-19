import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './user.entity';

@Entity('donor')
export class Donors {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 14, nullable: false })
  cpf: string;

  @Column({ type: 'varchar', name: 'blood_type', length: 16, nullable: true })
  bloodType?: string;

  @Column({ type: 'date', name: 'birth_date', nullable: true })
  birthDate?: Date;

  @Column({ type: 'varchar', length: 8, nullable: true })
  gender?: string;

  @Column({
    type: 'date',
    name: 'last_donation_date',
    nullable: true,
  })
  lastDonationDate?: Date | null;

  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_user_id' })
  user: Users;
}
