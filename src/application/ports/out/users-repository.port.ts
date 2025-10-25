import { Users } from '@/adapters/out/domain/user.entity';
import { User } from '@/application/core/domain/user.entity';

export interface UserRepositoryPort {
  save(user: Omit<User, 'id'>): Promise<Omit<User, 'password'>>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updatePassword(id: string, password: string): Promise<Users | null>;
  update(
    id: string,
    user: Omit<User, 'id' | 'password'>,
  ): Promise<Users | null>;
  updateAvatar(id: string, avatarPath: string): Promise<User | null>;
}
