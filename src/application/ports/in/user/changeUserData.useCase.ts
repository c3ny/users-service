import { User } from 'src/application/core/domain/user.entity';
import { Result, ResultFactory } from 'src/application/types/result.types';
import { UsersRepository } from 'src/adapters/out/users.repository';
import { Inject, Injectable } from '@nestjs/common';
import { ErrorsEnum } from 'src/application/core/errors/errors.enum';
import { USERS_REPOSITORY } from 'src/constants';

@Injectable()
export class ChangeUserDataUseCase {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    id: string,
    user: Omit<User, 'id' | 'password'>,
  ): Promise<Result<User>> {
    const updatedUser = await this.usersRepository.update(id, user);

    if (!updatedUser) {
      return ResultFactory.failure(ErrorsEnum.UserNotFound);
    }

    return ResultFactory.success(updatedUser);
  }
}
