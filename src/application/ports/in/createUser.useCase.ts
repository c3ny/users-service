import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/application/core/domain/user.entity';
import { UserRepositoryPort } from '../out/users-repository.port';
import { USERS_REPOSITORY } from 'src/constants';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UserRepositoryPort,
  ) {}

  execute(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
