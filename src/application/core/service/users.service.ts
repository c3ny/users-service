import { Injectable } from '@nestjs/common';
import { GetUserUseCase } from 'src/application/ports/in/getUser.useCase';
import { User } from '../domain/user.entity';
import { Result, ResultFactory } from 'src/application/types/result.types';
import { CreateUserUseCase } from 'src/application/ports/in/createUser.useCase';
import { HashStringUseCase } from 'src/modules/Hash/application/ports/in/hashString.useCase';
import { GetUserByEmailUseCase } from 'src/application/ports/in/getUserByEmail.useCase';
import { CompareHashUseCase } from 'src/modules/Hash/application/ports/in/compareHash.useCase';

@Injectable()
export class UsersService {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly hashStringUseCase: HashStringUseCase,
    private readonly compareHashUseCase: CompareHashUseCase,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
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

  async authenticate(
    user: Pick<User, 'email' | 'password'>,
  ): Promise<Result<User>> {
    const findByEmail = await this.getUserByEmailUseCase.execute(user.email);

    if (!findByEmail.isSuccess) {
      return ResultFactory.failure(findByEmail.error);
    }

    const verifyPassword = this.compareHashUseCase.execute({
      password: user.password ?? '',
      hash: findByEmail?.value?.password ?? '',
    });

    if (!verifyPassword) {
      return ResultFactory.failure('Invalid password');
    }

    delete findByEmail.value.password;

    return ResultFactory.success(findByEmail.value);
  }
}
