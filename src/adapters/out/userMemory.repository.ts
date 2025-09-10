import { Injectable } from '@nestjs/common';
import { User } from 'src/application/core/domain/user.entity';
import { UserRepositoryPort } from 'src/application/ports/out/users-repository.port';

@Injectable()
export class UserMemoryRepository implements UserRepositoryPort {
  private users: User[] = [];

  save(user: User): Promise<User> {
    this.users.push(user);
    return Promise.resolve(user);
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.find((user) => user.id === id) ?? null);
  }

  findByEmail(email: string): Promise<User | null> {
    return Promise.resolve(
      this.users.find((user) => user.email === email) ?? null,
    );
  }
}
