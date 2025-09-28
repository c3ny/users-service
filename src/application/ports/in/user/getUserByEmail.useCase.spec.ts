import { Test, TestingModule } from '@nestjs/testing';
import { GetUserByEmailUseCase } from './getUserByEmail.useCase';
import { UserRepositoryPort } from '../../out/users-repository.port';
import { USERS_REPOSITORY } from '../../../../constants';
import { User } from '../../../core/domain/user.entity';
import { ErrorsEnum } from '../../../core/errors/errors.enum';

describe('GetUserByEmailUseCase', () => {
  let useCase: GetUserByEmailUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;

  beforeEach(async () => {
    const mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByEmailUseCase,
        {
          provide: USERS_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserByEmailUseCase>(GetUserByEmailUseCase);
    userRepository = module.get(USERS_REPOSITORY);
  });

  describe('execute', () => {
    const mockUser: User = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      password: 'hashedPassword123',
      name: 'John Doe',
      city: 'São Paulo',
      uf: 'SP',
      zipcode: '01234-567',
      personType: 'DONOR',
    };

    it('should return user successfully when user with email exists', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await useCase.execute(mockUser.email);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
    });

    it('should return failure when user with email does not exist', async () => {
      const nonExistentEmail = 'nonexistent@example.com';
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await useCase.execute(nonExistentEmail);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserNotFound);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(nonExistentEmail);
    });

    it('should handle different email formats', async () => {
      const emailFormats = [
        'user@domain.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'firstname.lastname@company.com.br',
      ];

      for (const email of emailFormats) {
        const userWithEmail: User = { ...mockUser, email };
        userRepository.findByEmail.mockResolvedValue(userWithEmail);

        const result = await useCase.execute(email);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.email).toBe(email);
        expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      }
    });

    it('should handle case sensitivity in email search', async () => {
      const originalEmail = 'Test@Example.Com';
      const userWithEmail: User = { ...mockUser, email: originalEmail };

      userRepository.findByEmail.mockResolvedValue(userWithEmail);

      const result = await useCase.execute(originalEmail);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.email).toBe(originalEmail);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(originalEmail);
    });

    it('should handle different user types by email', async () => {
      const donorUser: User = {
        ...mockUser,
        personType: 'DONOR',
        email: 'donor@example.com',
      };
      const companyUser: User = {
        ...mockUser,
        id: '456e7890-f12c-45e6-b789-426614174222',
        personType: 'COMPANY',
        email: 'company@example.com',
      };

      userRepository.findByEmail
        .mockResolvedValueOnce(donorUser)
        .mockResolvedValueOnce(companyUser);

      const donorResult = await useCase.execute(donorUser.email);
      const companyResult = await useCase.execute(companyUser.email);

      expect(donorResult.isSuccess).toBe(true);
      expect(donorResult.value?.personType).toBe('DONOR');
      expect(companyResult.isSuccess).toBe(true);
      expect(companyResult.value?.personType).toBe('COMPANY');
    });

    it('should handle users with minimal data found by email', async () => {
      const minimalUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'minimal@example.com',
        name: 'Minimal User',
        city: 'São Paulo',
        uf: 'SP',
        personType: 'DONOR',
      };

      userRepository.findByEmail.mockResolvedValue(minimalUser);

      const result = await useCase.execute(minimalUser.email);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(minimalUser);
      expect(result.value?.password).toBeUndefined();
      expect(result.value?.zipcode).toBeUndefined();
    });

    it('should handle Brazilian domain emails', async () => {
      const brazilianEmails = [
        'user@gmail.com.br',
        'contact@empresa.com.br',
        'admin@hospital.org.br',
        'donor@sangue.gov.br',
      ];

      for (const email of brazilianEmails) {
        const userWithBrEmail: User = {
          ...mockUser,
          id: `user-${email.replace(/[@.]/g, '-')}`,
          email,
        };

        userRepository.findByEmail.mockResolvedValue(userWithBrEmail);

        const result = await useCase.execute(email);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.email).toBe(email);
      }
    });

    it('should handle repository errors gracefully', async () => {
      const email = 'test@example.com';
      userRepository.findByEmail.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(email)).rejects.toThrow(
        'Database connection failed',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should handle empty string email', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await useCase.execute('');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserNotFound);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('');
    });

    it('should handle null return from repository', async () => {
      const email = 'test@example.com';
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await useCase.execute(email);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserNotFound);
    });

    it('should handle undefined return from repository', async () => {
      const email = 'test@example.com';
      userRepository.findByEmail.mockResolvedValue(undefined as any);

      const result = await useCase.execute(email);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserNotFound);
    });

    it('should handle emails with special characters', async () => {
      const specialEmails = [
        'user+test@example.com',
        'user.test@example.com',
        'user_test@example.com',
        'user-test@example.com',
      ];

      for (const email of specialEmails) {
        const userWithSpecialEmail: User = {
          ...mockUser,
          id: `user-${email.replace(/[@.+_-]/g, '')}`,
          email,
        };

        userRepository.findByEmail.mockResolvedValue(userWithSpecialEmail);

        const result = await useCase.execute(email);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.email).toBe(email);
      }
    });

    it('should handle long email addresses', async () => {
      const longEmail =
        'very.long.email.address.with.many.dots@very-long-domain-name.example.com';
      const userWithLongEmail: User = { ...mockUser, email: longEmail };

      userRepository.findByEmail.mockResolvedValue(userWithLongEmail);

      const result = await useCase.execute(longEmail);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.email).toBe(longEmail);
    });

    it('should handle concurrent requests for the same email', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      const promises = Array(5)
        .fill(null)
        .map(() => useCase.execute(mockUser.email));
      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual(mockUser);
      });

      expect(userRepository.findByEmail).toHaveBeenCalledTimes(5);
    });

    it('should handle emails with numbers', async () => {
      const emailsWithNumbers = [
        'user123@example.com',
        'test2024@domain.com',
        '123user@test.com',
        'user.2024@example.org',
      ];

      for (const email of emailsWithNumbers) {
        const userWithNumberEmail: User = {
          ...mockUser,
          id: `user-${email.replace(/[@.]/g, '-')}`,
          email,
        };

        userRepository.findByEmail.mockResolvedValue(userWithNumberEmail);

        const result = await useCase.execute(email);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.email).toBe(email);
      }
    });

    it('should handle users from different states found by email', async () => {
      const states = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO'];

      for (const uf of states) {
        const email = `user-${uf.toLowerCase()}@example.com`;
        const userFromState: User = {
          ...mockUser,
          id: `user-${uf}`,
          email,
          uf,
          city: `Cidade ${uf}`,
        };

        userRepository.findByEmail.mockResolvedValue(userFromState);

        const result = await useCase.execute(email);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.uf).toBe(uf);
        expect(result.value?.email).toBe(email);
      }
    });

    it('should handle authentication scenarios', async () => {
      // Simulate authentication flow where we need to find user by email
      const authUser: User = {
        ...mockUser,
        email: 'auth@example.com',
        password: 'hashedPassword123',
      };

      userRepository.findByEmail.mockResolvedValue(authUser);

      const result = await useCase.execute(authUser.email);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.password).toBeDefined();
      expect(result.value?.email).toBe(authUser.email);
    });
  });
});
