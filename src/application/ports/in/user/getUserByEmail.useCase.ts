import { Result, ResultFactory } from 'src/application/types/result.types';
import { UseCase } from 'src/application/types/useCase.types';
import { User } from 'src/application/core/domain/user.entity';
import { UserRepositoryPort } from '../../out/users-repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { USERS_REPOSITORY } from 'src/constants';
import { ErrorsEnum } from 'src/application/core/errors/errors.enum';

@Injectable()
export class GetUserByEmailUseCase
  implements UseCase<string, Promise<Result<User>>>
{
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UserRepositoryPort,
  ) {}

  async execute(email: string): Promise<Result<User>> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      return ResultFactory.failure(ErrorsEnum.UserNotFound);
    }

    return ResultFactory.success(user);
  }
}
