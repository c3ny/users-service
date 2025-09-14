import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/application/core/domain/user.entity';
import { UserRepositoryPort } from 'src/application/ports/out/users-repository.port';
import { Users } from './domain/user.entity';
import { Repository } from 'typeorm';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class UsersRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async save(user: User): Promise<User> {
    return this.usersRepository.save(UserMapper.toPersistence(user));
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository
      .findOneBy({ id })
      .then((user) => (user ? UserMapper.toDomain(user) : null));
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .findOneBy({ email })
      .then((user) => (user ? UserMapper.toDomain(user) : null));
  }
}
