import { USERS_REPOSITORY } from 'src/constants';
import { UserRepositoryPort } from '../out/users-repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/application/core/domain/user.entity';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UserRepositoryPort,
  ) {}

  execute(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }
}
