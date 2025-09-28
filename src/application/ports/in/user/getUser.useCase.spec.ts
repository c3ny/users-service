import { Test, TestingModule } from '@nestjs/testing';
import { GetUserUseCase } from './getUser.useCase';
import { UserRepositoryPort } from '../../out/users-repository.port';
import { USERS_REPOSITORY } from '../../../../constants';
import { User } from '../../../core/domain/user.entity';
import { ErrorsEnum } from '../../../core/errors/errors.enum';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
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
        GetUserUseCase,
        {
          provide: USERS_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserUseCase>(GetUserUseCase);
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

    it('should return user successfully when user exists', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await useCase.execute(mockUser.id);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return failure when user does not exist', async () => {
      const nonExistentId = '987e6543-e21b-34d5-a678-426614174111';
      userRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(nonExistentId);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserNotFoundError);
      expect(userRepository.findById).toHaveBeenCalledWith(nonExistentId);
    });

    it('should handle different user types', async () => {
      const donorUser: User = { ...mockUser, personType: 'DONOR' };
      const companyUser: User = {
        ...mockUser,
        id: '456e7890-f12c-45e6-b789-426614174222',
        personType: 'COMPANY',
      };

      userRepository.findById
        .mockResolvedValueOnce(donorUser)
        .mockResolvedValueOnce(companyUser);

      const donorResult = await useCase.execute(donorUser.id);
      const companyResult = await useCase.execute(companyUser.id);

      expect(donorResult.isSuccess).toBe(true);
      expect(donorResult.value?.personType).toBe('DONOR');
      expect(companyResult.isSuccess).toBe(true);
      expect(companyResult.value?.personType).toBe('COMPANY');
    });

    it('should handle users with minimal data', async () => {
      const minimalUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'minimal@example.com',
        name: 'Minimal User',
        city: 'São Paulo',
        uf: 'SP',
        personType: 'DONOR',
      };

      userRepository.findById.mockResolvedValue(minimalUser);

      const result = await useCase.execute(minimalUser.id);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(minimalUser);
      expect(result.value?.password).toBeUndefined();
      expect(result.value?.zipcode).toBeUndefined();
    });

    it('should handle users from different states', async () => {
      const states = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO'];

      for (const uf of states) {
        const userFromState: User = {
          ...mockUser,
          id: `user-${uf}`,
          uf,
          city: `Cidade ${uf}`,
        };

        userRepository.findById.mockResolvedValue(userFromState);

        const result = await useCase.execute(userFromState.id);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.uf).toBe(uf);
        expect(result.value?.city).toBe(`Cidade ${uf}`);
      }
    });

    it('should handle different UUID formats', async () => {
      const uuidFormats = [
        '123e4567-e89b-12d3-a456-426614174000',
        '987e6543-e21b-34d5-a678-426614174111',
        '456f7890-f12c-45e6-b789-426614174222',
        '789a0123-a34b-56c7-d890-426614174333',
      ];

      for (const id of uuidFormats) {
        const userWithId: User = { ...mockUser, id };
        userRepository.findById.mockResolvedValue(userWithId);

        const result = await useCase.execute(id);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.id).toBe(id);
        expect(userRepository.findById).toHaveBeenCalledWith(id);
      }
    });

    it('should handle repository errors gracefully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      userRepository.findById.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(userId)).rejects.toThrow(
        'Database connection failed',
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should handle empty string ID', async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserNotFoundError);
      expect(userRepository.findById).toHaveBeenCalledWith('');
    });

    it('should handle null return from repository', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      userRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(userId);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserNotFoundError);
    });

    it('should handle undefined return from repository', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      userRepository.findById.mockResolvedValue(undefined as any);

      const result = await useCase.execute(userId);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserNotFoundError);
    });

    it('should handle users with special characters in names', async () => {
      const specialCharUser: User = {
        ...mockUser,
        name: 'José María Ñuñez',
        city: 'Poços de Caldas',
      };

      userRepository.findById.mockResolvedValue(specialCharUser);

      const result = await useCase.execute(specialCharUser.id);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.name).toBe('José María Ñuñez');
      expect(result.value?.city).toBe('Poços de Caldas');
    });

    it('should handle users with different zipcode formats', async () => {
      const zipcodeFormats = ['01234-567', '01234567', '12345-678'];

      for (const zipcode of zipcodeFormats) {
        const userWithZipcode: User = {
          ...mockUser,
          id: `user-${zipcode.replace(/\D/g, '')}`,
          zipcode,
        };

        userRepository.findById.mockResolvedValue(userWithZipcode);

        const result = await useCase.execute(userWithZipcode.id);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.zipcode).toBe(zipcode);
      }
    });

    it('should handle users with long names', async () => {
      const longNameUser: User = {
        ...mockUser,
        name: 'João da Silva Santos Oliveira Pereira de Souza Nascimento',
      };

      userRepository.findById.mockResolvedValue(longNameUser);

      const result = await useCase.execute(longNameUser.id);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.name).toBe(longNameUser.name);
    });

    it('should handle concurrent requests for the same user', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const promises = Array(5)
        .fill(null)
        .map(() => useCase.execute(mockUser.id));
      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual(mockUser);
      });

      expect(userRepository.findById).toHaveBeenCalledTimes(5);
    });

    it('should handle different email formats', async () => {
      const emailFormats = [
        'user@domain.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      for (const email of emailFormats) {
        const userWithEmail: User = {
          ...mockUser,
          id: `user-${email.replace(/[@.+]/g, '-')}`,
          email,
        };

        userRepository.findById.mockResolvedValue(userWithEmail);

        const result = await useCase.execute(userWithEmail.id);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.email).toBe(email);
      }
    });
  });
});
