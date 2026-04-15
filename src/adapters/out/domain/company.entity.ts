import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './user.entity';
import { CompanySchedule, CompanyStatus, CompanyType } from '@/application/core/domain/company.entity';

@Entity('company')
export class Companies {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 18, unique: true })
  cnpj: string;

  @Column({ type: 'varchar', name: 'institution_name', length: 100 })
  institutionName: string;

  @Column({ type: 'varchar', length: 15 })
  cnes: string;

  @Column({ type: 'varchar', length: 80, unique: true, nullable: true })
  slug: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  type: CompanyType | null;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: CompanyStatus;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, name: 'banner_image', nullable: true })
  bannerImage: string | null;

  @Column({ type: 'varchar', length: 500, name: 'logo_image', nullable: true })
  logoImage: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  whatsapp: string | null;

  @Column({ type: 'varchar', length: 255, name: 'contact_email', nullable: true })
  contactEmail: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  neighborhood: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  uf: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  zipcode: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ type: 'jsonb', nullable: true })
  schedule: CompanySchedule[] | null;

  @Column({ type: 'boolean', name: 'accepts_donations', default: true })
  acceptsDonations: boolean;

  @Column({ type: 'boolean', name: 'accepts_scheduling', default: true })
  acceptsScheduling: boolean;

  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_user_id' })
  user: Users;
}
