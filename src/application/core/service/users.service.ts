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
import { UpdateProfileDto } from '@/adapters/in/dto/update-profile.dto';
import { CreateUserRequest, PersonType } from '@/application/types/user.types';
import { CreateCompanyUseCase } from '@/application/ports/in/company/createCompany.useCase';
import { GenerateJwtUseCase } from '@/modules/Hash/application/ports/in/generateJwt.useCase';
import { UpdateUserAvatarUseCase } from '@/application/ports/in/user/updateUserAvatar.useCase';
import { AuthenticateUserDto } from '@/adapters/in/dto/authenticate-user.dto';
import { GetCompanyByUserIdUseCase } from '@/application/ports/in/company/getCompanyByUserId.useCase';
import { BloodstockRepository } from '@/adapters/out/bloodstock.repository';
import { sanitizeUser } from '../utils/sanitize-user.util';
import { generateUniqueSlug } from '../utils/slug.util';
import { CompanyRepositoryPort } from '@/application/ports/out/company-repository.port';
import { DonorRepositoryPort } from '@/application/ports/out/donor-repository.port';
import { Inject } from '@nestjs/common';
import { COMPANY_REPOSITORY, DONOR_REPOSITORY } from '@/constants';

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
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepositoryPort,
    @Inject(DONOR_REPOSITORY)
    private readonly donorRepository: DonorRepositoryPort,
  ) {}

  async getUserById(id: string): Promise<Result<User>> {
    const user = await this.getUserUseCase.execute(id);

    if (!user.isSuccess) {
      return ResultFactory.failure(user.error);
    }

    return ResultFactory.success(sanitizeUser(user.value));
  }

  /**
   * Retorna dados do donor (cpf, bloodType, birthDate, gender,
   * lastDonationDate) para o usuario autenticado. null se nao houver donor
   * registrado (usuario COMPANY ou DONOR com cadastro incompleto).
   */
  async getDonorProfile(userId: string) {
    return this.getDonorByUserIdUseCase.execute(userId);
  }

  /**
   * Edição parcial de perfil (PATCH /users/:id).
   * Apenas o próprio usuário pode atualizar — controller valida ownership.
   * Campos não-presentes no DTO permanecem inalterados.
   */
  async updateProfile(
    id: string,
    data: UpdateProfileDto,
  ): Promise<Result<User>> {
    const existing = await this.getUserUseCase.execute(id);

    if (!existing.isSuccess) {
      return ResultFactory.failure(existing.error);
    }

    const merged: Omit<User, 'id' | 'password'> = {
      ...existing.value,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.uf !== undefined && { uf: data.uf }),
      ...(data.zipcode !== undefined && { zipcode: data.zipcode }),
      ...(data.description !== undefined && { description: data.description }),
    };

    const updated = await this.changeUserDataUseCase.execute({
      id,
      user: merged,
    });

    if (!updated.isSuccess) {
      return ResultFactory.failure(updated.error);
    }

    // Atualiza campos de donor (gender, lastDonationDate) se o usuario for
    // DONOR e enviou algum deles. Campos ausentes permanecem inalterados;
    // lastDonationDate=null explicito limpa o valor ("nunca doei").
    const shouldUpdateDonor =
      (existing.value.personType as PersonType) === PersonType.DONOR &&
      (data.gender !== undefined || data.lastDonationDate !== undefined);

    if (shouldUpdateDonor) {
      const donor = await this.getDonorByUserIdUseCase.execute(id);
      if (donor) {
        const nextGender =
          data.gender === undefined ? (donor.gender ?? null) : data.gender;
        const nextLastDonationDate =
          data.lastDonationDate === undefined
            ? (donor.lastDonationDate ?? null)
            : data.lastDonationDate === null
              ? null
              : new Date(data.lastDonationDate);

        await this.donorRepository.update({
          ...donor,
          gender: nextGender,
          lastDonationDate: nextLastDonationDate,
        });
      }
    }

    return ResultFactory.success(sanitizeUser(updated.value));
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
          gender: user.gender ?? null,
          lastDonationDate: user.lastDonationDate ?? null,
        });

        if (!donor.isSuccess) {
          return ResultFactory.partialSuccess(result.value);
        }

        break;
      }
      case PersonType.COMPANY: {
        const slug = await generateUniqueSlug(user.institutionName, (s) =>
          this.companyRepository.existsBySlug(s),
        );
        const company = await this.createCompanyUseCase.execute({
          cnpj: user.cnpj,
          institutionName: user.institutionName,
          cnes: user.cnes,
          fkUserId: result.value.id,
          slug,
          status: 'ACTIVE',
          acceptsDonations: true,
          acceptsScheduling: true,
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

    // Dummy scrypt hash (salt:derivedKey, 16B salt hex + 64B hash hex) to keep
    // constant-time behavior when the email is not found — prevents user
    // enumeration via timing side-channel.
    const dummyHash =
      '00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    const hashToCompare =
      findByEmail.isSuccess && findByEmail.value.password
        ? findByEmail.value.password
        : dummyHash;

    const verifyPassword = this.compareHashUseCase.execute({
      password: user.password ?? '',
      hash: hashToCompare,
    });

    if (!findByEmail.isSuccess || !verifyPassword) {
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
            gender: data.gender ?? null,
            lastDonationDate: data.lastDonationDate
              ? new Date(data.lastDonationDate)
              : null,
          });
          if (!donor.isSuccess) {
            return ResultFactory.failure(donor.error);
          }
        }
        break;
      }
      case PersonType.COMPANY: {
        const slug = await generateUniqueSlug(data.institutionName ?? '', (s) =>
          this.companyRepository.existsBySlug(s),
        );
        const company = await this.createCompanyUseCase.execute({
          cnpj: data.cnpj ?? '',
          institutionName: data.institutionName ?? '',
          cnes: data.cnes ?? '',
          fkUserId: userId,
          slug,
          status: 'ACTIVE',
          acceptsDonations: true,
          acceptsScheduling: true,
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
        phone: data.phone,
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

    this.logger.info('Profile completed', {
      userId,
      personType: data.personType,
    });

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
