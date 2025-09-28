import { User } from '@/application/core/domain/user.entity';
import { Result, ResultFactory } from '@/application/types/result.types';
import { UseCase } from '@/application/types/useCase.types';
import { UserRepositoryPort } from '../../out/users-repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { USERS_REPOSITORY } from '@/constants';
import { ErrorsEnum } from '@/application/core/errors/errors.enum';

type ChangePasswordUseCaseParams = {
  id: string;
  newPassword: string;
};

@Injectable()
export class ChangePasswordUseCase
  implements UseCase<ChangePasswordUseCaseParams, Promise<Result<User>>>
{
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UserRepositoryPort,
  ) {}

  async execute(user: ChangePasswordUseCaseParams): Promise<Result<User>> {
    const updatedUser = await this.usersRepository.updatePassword(
      user.id,
      user.newPassword,
    );

    if (!updatedUser) {
      return ResultFactory.failure(ErrorsEnum.UserNotFound);
    }

    return ResultFactory.success(updatedUser);
  }
}
