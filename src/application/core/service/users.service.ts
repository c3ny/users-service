import { Injectable } from '@nestjs/common';
import { GetUserUseCase } from '@/application/ports/in/user/getUser.useCase';
import { User } from '../domain/user.entity';
import { Result, ResultFactory } from '@/application/types/result.types';
import { CreateUserUseCase } from '@/application/ports/in/user/createUser.useCase';
import { HashStringUseCase } from '@/modules/Hash/application/ports/in/hashString.useCase';
import { GetUserByEmailUseCase } from '@/application/ports/in/user/getUserByEmail.useCase';
import { CompareHashUseCase } from '@/modules/Hash/application/ports/in/compareHash.useCase';
import { ChangePasswordUseCase } from '@/application/ports/in/user/changePassword.useCase';
import { ErrorsEnum } from '../errors/errors.enum';
import { CreateDonorUseCase } from '@/application/ports/in/donor/createDonor.useCase';
import { CreateUserRequest, PersonType } from '@/application/types/user.types';
import { CreateCompanyUseCase } from '@/application/ports/in/company/createCompany.useCase';

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
    private readonly createCompanyUseCase: CreateCompanyUseCase,
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

    if (!user.personType) {
      return ResultFactory.failure(ErrorsEnum.UserNotFoundError);
    }

    switch (user.personType) {
      case PersonType.DONOR: {
        const donor = await this.createDonorUseCase.execute({
          cpf: user.cpf,
          bloodType: user.bloodType,
          birthDate: user.birthDate,
          fkUserId: result.value.id,
        });

        if (!donor.isSuccess) {
          return ResultFactory.partialSuccess(result.value);
        }

        break;
      }
      case PersonType.COMPANY: {
        const company = await this.createCompanyUseCase.execute({
          cnpj: user.cnpj,
          institutionName: user.institutionName,
          cnes: user.cnes,
          fkUserId: result.value.id,
        });

        if (!company.isSuccess) {
          return ResultFactory.partialSuccess(result.value);
        }

        break;
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
