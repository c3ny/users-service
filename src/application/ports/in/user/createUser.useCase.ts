import { Inject, Injectable } from '@nestjs/common';
import { User } from '@/application/core/domain/user.entity';
import { UserRepositoryPort } from '../../out/users-repository.port';
import { USERS_REPOSITORY } from '@/constants';
import { UseCase } from '@/application/types/useCase.types';
import { Result, ResultFactory } from '@/application/types/result.types';
import { GetUserByEmailUseCase } from './getUserByEmail.useCase';
import { ErrorsEnum } from '@/application/core/errors/errors.enum';

@Injectable()
export class CreateUserUseCase implements UseCase<User, Promise<Result<User>>> {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UserRepositoryPort,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
  ) {}

  async execute(user: Omit<User, 'id'>): Promise<Result<User>> {
    const existingUser = await this.getUserByEmailUseCase.execute(user.email);

    if (existingUser.isSuccess) {
      return ResultFactory.failure(ErrorsEnum.UserAlreadyExists);
    }

    const savedUser = await this.usersRepository.save(user);

    return ResultFactory.success(savedUser);
  }
}
