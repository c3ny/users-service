import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@/application/types/useCase.types';
import { Result, ResultFactory } from '@/application/types/result.types';
import { User } from '@/application/core/domain/user.entity';
import { UserRepositoryPort } from '@/application/ports/out/users-repository.port';
import { USERS_REPOSITORY } from '@/constants';
import { ErrorsEnum } from '@/application/core/errors/errors.enum';

export interface UpdateUserAvatarInput {
  userId: string;
  avatarPath: string;
}

@Injectable()
export class UpdateUserAvatarUseCase
  implements UseCase<UpdateUserAvatarInput, Promise<Result<User>>>
{
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UserRepositoryPort,
  ) {}

  async execute(input: UpdateUserAvatarInput): Promise<Result<User>> {
    const user = await this.usersRepository.findById(input.userId);

    if (!user) {
      return ResultFactory.failure(ErrorsEnum.UserNotFound);
    }

    const updatedUser = await this.usersRepository.updateAvatar(
      input.userId,
      input.avatarPath,
    );

    if (!updatedUser) {
      return ResultFactory.failure(ErrorsEnum.UserNotFound);
    }

    return ResultFactory.success(updatedUser);
  }
}
