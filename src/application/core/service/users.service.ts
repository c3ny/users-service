import { Injectable } from '@nestjs/common';
import { GetUserUseCase } from 'src/application/ports/in/getUser.useCase';
import { User } from '../domain/user.entity';
import { Result, ResultFactory } from 'src/application/types/result.types';
import { CreateUserUseCase } from 'src/application/ports/in/createUser.useCase';
import { HashStringUseCase } from 'src/modules/Hash/application/ports/in/hashString.useCase';

@Injectable()
export class UsersService {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly hashStringUseCase: HashStringUseCase,
  ) {}

  async getUserById(id: string): Promise<Result<User>> {
    const user = await this.getUserUseCase.execute(id);

    if (!user.isSuccess) {
      return ResultFactory.failure(user.error);
    }

    return ResultFactory.success(user.value);
  }

  async createUser(user: Omit<User, 'id'>): Promise<Result<User>> {
    const hashedPassword = this.hashStringUseCase.execute(user?.password ?? '');

    user.password = hashedPassword;

    const result = await this.createUserUseCase.execute(user);

    if (!result.isSuccess) {
      return ResultFactory.failure(result.error);
    }

    return ResultFactory.success(result.value);
  }
}
