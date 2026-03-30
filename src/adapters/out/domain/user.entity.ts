import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  uf: string;

  @Column({ nullable: true })
  zipcode?: string;

  @Column({
    name: 'person_type',
  })
  personType: string;

  @Column({
    name: 'avatar_path',
    nullable: true,
  })
  avatarPath?: string;

  @Column({
    name: 'google_id',
    nullable: true,
    unique: true,
  })
  googleId?: string;

  @Column({
    name: 'apple_id',
    nullable: true,
    unique: true,
  })
  appleId?: string;

  @Column({
    name: 'is_profile_complete',
    default: true,
  })
  isProfileComplete: boolean;
}
