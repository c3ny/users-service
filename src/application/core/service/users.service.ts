import { Injectable } from '@nestjs/common';
import { GetUserUseCase } from 'src/application/ports/in/user/getUser.useCase';
import { User } from '../domain/user.entity';
import { Result, ResultFactory } from 'src/application/types/result.types';
import { CreateUserUseCase } from 'src/application/ports/in/user/createUser.useCase';
import { HashStringUseCase } from 'src/modules/Hash/application/ports/in/hashString.useCase';
import { GetUserByEmailUseCase } from 'src/application/ports/in/user/getUserByEmail.useCase';
import { CompareHashUseCase } from 'src/modules/Hash/application/ports/in/compareHash.useCase';
import { ChangePasswordUseCase } from 'src/application/ports/in/user/changePassword.useCase';
import { ErrorsEnum } from '../errors/errors.enum';
import { CreateDonorUseCase } from 'src/application/ports/in/donor/createDonor.useCase';
import {
  CreateUserRequest,
  PersonType,
} from 'src/application/types/user.types';

@Injectable()
export class UsersService {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly hashStringUseCase: HashStringUseCase,
    private readonly compareHashUseCase: CompareHashUseCase,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly createDonorUseCase: CreateDonorUseCase,
  ) {}

  async getUserById(id: string): Promise<Result<User>> {
    const user = await this.getUserUseCase.execute(id);

    if (!user.isSuccess) {
      return ResultFactory.failure(user.error);
    }

    delete user.value.password;

    return ResultFactory.success(user.value);
  }

  async createUser(user: CreateUserRequest): Promise<Result<User>> {
    const hashedPassword = this.hashStringUseCase.execute(user?.password ?? '');

    user.password = hashedPassword;

    const result = await this.createUserUseCase.execute(user);

    if (!result.isSuccess) {
      return ResultFactory.failure(result.error);
    }

    if (user.personType === PersonType.DONOR) {
      const donor = await this.createDonorUseCase.execute({
        cpf: user.cpf,
        bloodType: user.bloodType,
        birthDate: user.birthDate,
        fkUserId: result.value.id,
      });

      if (!donor.isSuccess) {
        return ResultFactory.partialSuccess(result.value);
      }
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
      return ResultFactory.failure(ErrorsEnum.InvalidPassword);
    }

    delete findByEmail.value.password;

    return ResultFactory.success(findByEmail.value);
  }

  async changePassword(
    id: string,
    passwords: { old: string; new: string },
  ): Promise<Result<User>> {
    const getUser = await this.getUserUseCase.execute(id);

    if (!getUser.isSuccess) {
      return ResultFactory.failure(getUser.error);
    }

    const verifyPassword = this.compareHashUseCase.execute({
      password: passwords.old,
      hash: getUser.value.password ?? '',
    });

    if (!verifyPassword) {
      return ResultFactory.failure(ErrorsEnum.InvalidPassword);
    }

    const newPassword = this.hashStringUseCase.execute(passwords.new);

    const result = await this.changePasswordUseCase.execute({
      id,
      newPassword,
    });

    if (!result.isSuccess) {
      return ResultFactory.failure(result.error);
    }

    return ResultFactory.success(result.value);
  }
}
