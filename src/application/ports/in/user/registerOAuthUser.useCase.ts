import { Inject, Injectable } from '@nestjs/common';
import { User } from '@/application/core/domain/user.entity';
import { UserRepositoryPort } from '../../out/users-repository.port';
import { USERS_REPOSITORY } from '@/constants';
import { UseCase } from '@/application/types/useCase.types';
import { Result, ResultFactory } from '@/application/types/result.types';

export type OAuthProvider = 'google' | 'apple';

export interface RegisterOAuthUserInput {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name: string;
}

@Injectable()
export class RegisterOAuthUserUseCase
  implements UseCase<RegisterOAuthUserInput, Promise<Result<User>>>
{
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UserRepositoryPort,
  ) {}

  async execute(input: RegisterOAuthUserInput): Promise<Result<User>> {
    // 1. Check if user already exists with this OAuth provider ID
    const existingByProvider =
      input.provider === 'google'
        ? await this.usersRepository.findByGoogleId(input.providerId)
        : await this.usersRepository.findByAppleId(input.providerId);

    if (existingByProvider) {
      return ResultFactory.success(existingByProvider);
    }

    // 2. Check if user exists with this email (link accounts)
    const existingByEmail = await this.usersRepository.findByEmail(input.email);

    if (existingByEmail) {
      // Link OAuth provider ID to existing account
      const updatedFields =
        input.provider === 'google'
          ? { ...existingByEmail, googleId: input.providerId }
          : { ...existingByEmail, appleId: input.providerId };

      const { id, password: _password, ...updateData } = updatedFields;
      await this.usersRepository.update(id, updateData);

      return ResultFactory.success({ ...existingByEmail, ...updatedFields });
    }

    // 3. Create new OAuth user (incomplete profile)
    const newUser: Omit<User, 'id'> = {
      email: input.email,
      name: input.name,
      city: '',
      uf: '',
      personType: '',
      isProfileComplete: false,
      ...(input.provider === 'google'
        ? { googleId: input.providerId }
        : { appleId: input.providerId }),
    };

    const savedUser = await this.usersRepository.save(newUser);

    return ResultFactory.success(savedUser as User);
  }
}
