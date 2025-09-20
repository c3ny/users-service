import { User } from 'src/application/core/domain/user.entity';

export interface UserRepositoryPort {
  save(user: Omit<User, 'id'>): Promise<Omit<User, 'password'>>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
