import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '@/shared/logger/app-logger.service';
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
import { GetDonorByCpfUseCase } from '@/application/ports/in/donor/getDonorByCpf.useCase';
import { GetDonorByUserIdUseCase } from '@/application/ports/in/donor/getDonorByUserId.useCase';
import {
  RegisterOAuthUserUseCase,
  RegisterOAuthUserInput,
} from '@/application/ports/in/user/registerOAuthUser.useCase';
import { ChangeUserDataUseCase } from '@/application/ports/in/user/changeUserData.useCase';
import { CompleteProfileDto } from '@/adapters/in/dto/complete-profile.dto';
import { CreateUserRequest, PersonType } from '@/application/types/user.types';
import { CreateCompanyUseCase } from '@/application/ports/in/company/createCompany.useCase';
import { GenerateJwtUseCase } from '@/modules/Hash/application/ports/in/generateJwt.useCase';
import { UpdateUserAvatarUseCase } from '@/application/ports/in/user/updateUserAvatar.useCase';
import { AuthenticateUserDto } from '@/adapters/in/dto/authenticate-user.dto';
import { GetCompanyByUserIdUseCase } from '@/application/ports/in/company/getCompanyByUserId.useCase';
import { BloodstockRepository } from '@/adapters/out/bloodstock.repository';
import { sanitizeUser } from '../utils/sanitize-user.util';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly hashStringUseCase: HashStringUseCase,
    private readonly compareHashUseCase: CompareHashUseCase,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly createDonorUseCase: CreateDonorUseCase,
    private readonly getDonorByCpfUseCase: GetDonorByCpfUseCase,
    private readonly getDonorByUserIdUseCase: GetDonorByUserIdUseCase,
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly generateJwtUseCase: GenerateJwtUseCase,
    private readonly updateUserAvatarUseCase: UpdateUserAvatarUseCase,
    private readonly getCompanyByUserIdUseCase: GetCompanyByUserIdUseCase,
    private readonly bloodstockRepository: BloodstockRepository,
    private readonly registerOAuthUserUseCase: RegisterOAuthUserUseCase,
    private readonly changeUserDataUseCase: ChangeUserDataUseCase,
  ) {}

  async getUserById(id: string): Promise<Result<User>> {
    const user = await this.getUserUseCase.execute(id);

    if (!user.isSuccess) {
      return ResultFactory.failure(user.error);
    }

    return ResultFactory.success(sanitizeUser(user.value));
  }

  async createUser(user: CreateUserRequest): Promise<Result<User>> {
    if (user.personType === PersonType.DONOR && user.cpf) {
      const existingDonor = await this.getDonorByCpfUseCase.execute(user.cpf);
      if (existingDonor) {
        return ResultFactory.failure(ErrorsEnum.DonorAlreadyExists);
      }
    }

    const hashedPassword = this.hashStringUseCase.execute(user?.password ?? '');

    user.password = hashedPassword;

    const result = await this.createUserUseCase.execute({
      ...user,
      isProfileComplete: true,
    });

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
        await this.bloodstockRepository.initializeCompanyStock({
          companyId: company.value.id,
          cnpj: user.cnpj,
          cnes: user.cnes,
          institutionName: user.institutionName,
        });

        break;
      }
    }

    this.logger.info('User created successfully', {
      userId: result.value.id,
      personType: user.personType,
    });

    return ResultFactory.success(sanitizeUser(result.value));
  }

  async authenticate(
    user: AuthenticateUserDto,
  ): Promise<Result<{ user: User; token: string }>> {
    const findByEmail = await this.getUserByEmailUseCase.execute(user.email);

    if (!findByEmail.isSuccess) {
      return ResultFactory.failure(findByEmail.error);
    }

    const verifyPassword = this.compareHashUseCase.execute({
      password: user.password ?? '',
      hash: findByEmail.value.password ?? '',
    });

    if (!verifyPassword) {
      return ResultFactory.failure(ErrorsEnum.InvalidPassword);
    }

    // Busca companyId se for usuário do tipo COMPANY
    let companyId: string | null = null;
    if (findByEmail.value.personType === 'COMPANY') {
      const companyResult = await this.getCompanyByUserIdUseCase.execute(
        findByEmail.value.id,
      );
      if (companyResult.isSuccess) {
        companyId = companyResult.value.id;
      }
    }

    const safeUser = sanitizeUser(findByEmail.value);

    const token = this.generateJwtUseCase.execute(
      {
        id: findByEmail.value.id,
        email: findByEmail.value.email,
        personType: findByEmail.value.personType,
        companyId,
        isProfileComplete: findByEmail.value.isProfileComplete ?? true,
      },
      user.rememberMe ? '30d' : '1h',
    );

    this.logger.info('User authenticated', {
      userId: findByEmail.value.id,
      personType: findByEmail.value.personType,
    });

    return ResultFactory.success({
      user: safeUser,
      token,
    });
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

    this.logger.info('Password changed successfully', { userId: id });

    return ResultFactory.success(result.value);
  }

  async authenticateOAuth(
    input: RegisterOAuthUserInput,
  ): Promise<Result<{ user: User; token: string }>> {
    const result = await this.registerOAuthUserUseCase.execute(input);

    if (!result.isSuccess) {
      return ResultFactory.failure(result.error);
    }

    const user = result.value;

    let companyId: string | null = null;
    if (user.personType === 'COMPANY') {
      const companyResult = await this.getCompanyByUserIdUseCase.execute(
        user.id,
      );
      if (companyResult.isSuccess) {
        companyId = companyResult.value.id;
      }
    }

    const token = this.generateJwtUseCase.execute({
      id: user.id,
      email: user.email,
      personType: user.personType,
      companyId,
      isProfileComplete: user.isProfileComplete,
    });

    this.logger.info('OAuth user authenticated', {
      userId: user.id,
      provider: input.provider,
      personType: user.personType,
    });

    return ResultFactory.success({ user: sanitizeUser(user), token });
  }

  async completeProfile(
    userId: string,
    data: CompleteProfileDto,
  ): Promise<Result<{ user: User; token: string }>> {
    const getUser = await this.getUserUseCase.execute(userId);

    if (!getUser.isSuccess) {
      return ResultFactory.failure(getUser.error);
    }

    const existingUser = getUser.value;

    // Create donor or company profile
    switch (data.personType) {
      case PersonType.DONOR: {
        const existingDonor =
          await this.getDonorByUserIdUseCase.execute(userId);
        if (!existingDonor) {
          const donor = await this.createDonorUseCase.execute({
            cpf: data.cpf ?? '',
            bloodType: data.bloodType ?? '',
            birthDate: data.birthDate ? new Date(data.birthDate) : new Date(),
            fkUserId: userId,
          });
          if (!donor.isSuccess) {
            return ResultFactory.failure(donor.error);
          }
        }
        break;
      }
      case PersonType.COMPANY: {
        const company = await this.createCompanyUseCase.execute({
          cnpj: data.cnpj ?? '',
          institutionName: data.institutionName ?? '',
          cnes: data.cnes ?? '',
          fkUserId: userId,
        });
        if (!company.isSuccess) {
          return ResultFactory.failure(company.error);
        }
        await this.bloodstockRepository.initializeCompanyStock({
          companyId: company.value.id,
          cnpj: data.cnpj ?? '',
          cnes: data.cnes ?? '',
          institutionName: data.institutionName ?? '',
        });
        break;
      }
    }

    // Update user fields
    const updated = await this.changeUserDataUseCase.execute({
      id: userId,
      user: {
        ...existingUser,
        city: data.city,
        uf: data.uf,
        personType: data.personType,
        isProfileComplete: true,
      },
    });

    if (!updated.isSuccess) {
      return ResultFactory.failure(updated.error);
    }

    let companyId: string | null = null;
    if (data.personType === PersonType.COMPANY) {
      const companyResult =
        await this.getCompanyByUserIdUseCase.execute(userId);
      if (companyResult.isSuccess) {
        companyId = companyResult.value.id;
      }
    }

    const token = this.generateJwtUseCase.execute({
      id: userId,
      email: existingUser.email,
      personType: data.personType,
      companyId,
      isProfileComplete: true,
    });

    const safeUser = sanitizeUser({
      ...existingUser,
      ...updated.value,
      isProfileComplete: true,
    });

    this.logger.info('Profile completed', { userId, personType: data.personType });

    return ResultFactory.success({ user: safeUser, token });
  }

  async uploadAvatar(
    userId: string,
    avatarPath: string | null,
  ): Promise<Result<User>> {
    const result = await this.updateUserAvatarUseCase.execute({
      userId,
      avatarPath,
    });

    if (!result.isSuccess) {
      return ResultFactory.failure(result.error);
    }

    return ResultFactory.success(sanitizeUser(result.value));
  }
}
