import { USERS_REPOSITORY } from 'src/constants';
import { UserRepositoryPort } from '../../out/users-repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/application/core/domain/user.entity';
import { UseCase } from 'src/application/types/useCase.types';
import { Result, ResultFactory } from 'src/application/types/result.types';
import { ErrorsEnum } from 'src/application/core/errors/errors.enum';

@Injectable()
export class GetUserUseCase implements UseCase<string, Promise<Result<User>>> {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UserRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<User>> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      return ResultFactory.failure(ErrorsEnum.UserNotFoundError);
    }

    return ResultFactory.success(user);
  }
}
