import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
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
}
