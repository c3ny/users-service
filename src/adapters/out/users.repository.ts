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

  async save(user: User): Promise<Omit<User, 'password'>> {
    const userToSave = UserMapper.toPersistence(user);

    const savedUser = await this.usersRepository.save(userToSave);

    delete savedUser.password;

    return savedUser;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      return null;
    }

    delete user.password;

    return UserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      return null;
    }

    delete user.password;

    return UserMapper.toDomain(user);
  }
}
