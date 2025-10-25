import { User } from '@/application/core/domain/user.entity';
import { Result, ResultFactory } from '@/application/types/result.types';
import { Inject, Injectable } from '@nestjs/common';
import { ErrorsEnum } from '@/application/core/errors/errors.enum';
import { USERS_REPOSITORY } from '@/constants';
import { UseCase } from '@/application/types/useCase.types';
import { UserRepositoryPort } from '../../out/users-repository.port';

@Injectable()
export class ChangeUserDataUseCase
  implements
    UseCase<
      { id: string; user: Omit<User, 'id' | 'password'> },
      Promise<Result<User>>
    >
{
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UserRepositoryPort,
  ) {}

  async execute({
    id,
    user,
  }: {
    id: string;
    user: Omit<User, 'id' | 'password'>;
  }): Promise<Result<User>> {
    const updatedUser = await this.usersRepository.update(id, user);

    if (!updatedUser) {
      return ResultFactory.failure(ErrorsEnum.UserNotFound);
    }

    return ResultFactory.success(updatedUser);
  }
}
