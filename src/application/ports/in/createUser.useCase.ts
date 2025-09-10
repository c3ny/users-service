import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/application/core/domain/user.entity';
import { UserRepositoryPort } from '../out/users-repository.port';
import { USERS_REPOSITORY } from 'src/constants';
import { GetUserUseCase } from './getUser.useCase';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UserRepositoryPort,
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  async execute(user: User): Promise<User> {
    const existingUser = await this.getUserUseCase.executeByEmail(user.email);

    if (existingUser !== null) {
      throw new Error('User already exists');
    }

    return this.usersRepository.save(user);
  }
}
