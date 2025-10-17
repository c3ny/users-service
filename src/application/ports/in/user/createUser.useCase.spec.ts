import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './createUser.useCase';
import { GetUserByEmailUseCase } from './getUserByEmail.useCase';
import { UserRepositoryPort } from '../../out/users-repository.port';
import { USERS_REPOSITORY } from '../../../../constants';
import { User } from '../../../core/domain/user.entity';
import { ErrorsEnum } from '../../../core/errors/errors.enum';
import { ResultFactory } from '../../../types/result.types';
import {
  createMockRepository,
  createMockUseCase,
} from '../../../../test-setup';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let getUserByEmailUseCase: jest.Mocked<GetUserByEmailUseCase>;

  beforeAll(async () => {
    const mockUserRepository = createMockRepository();
    const mockGetUserByEmailUseCase = createMockUseCase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: USERS_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: GetUserByEmailUseCase,
          useValue: mockGetUserByEmailUseCase,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get(USERS_REPOSITORY);
    getUserByEmailUseCase = module.get(GetUserByEmailUseCase);
  });

  describe('execute', () => {
    const validUserData: Omit<User, 'id'> = {
      email: 'test@example.com',
      password: 'hashedPassword123',
      name: 'John Doe',
      city: 'São Paulo',
      uf: 'SP',
      zipcode: '01234-567',
      personType: 'DONOR',
    };

    it('should create a new user successfully when email does not exist', async () => {
      const savedUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...validUserData,
      };

      getUserByEmailUseCase.execute.mockResolvedValue(
        ResultFactory.failure(ErrorsEnum.UserNotFound),
      );
      userRepository.save.mockResolvedValue(savedUser);

      const result = await useCase.execute(validUserData);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(savedUser);
      expect(getUserByEmailUseCase.execute).toHaveBeenCalledWith(
        validUserData.email,
      );
      expect(userRepository.save).toHaveBeenCalledWith(validUserData);
    });

    it('should return failure when user with email already exists', async () => {
      const existingUser: User = {
        id: '987e6543-e21b-34d5-a678-426614174111',
        ...validUserData,
      };

      getUserByEmailUseCase.execute.mockResolvedValue(
        ResultFactory.success(existingUser),
      );

      const result = await useCase.execute(validUserData);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserAlreadyExists);
      expect(getUserByEmailUseCase.execute).toHaveBeenCalledWith(
        validUserData.email,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should handle different person types', async () => {
      const donorUser: Omit<User, 'id'> = {
        ...validUserData,
        personType: 'DONOR',
      };
      const companyUser: Omit<User, 'id'> = {
        ...validUserData,
        personType: 'COMPANY',
        email: 'company@example.com',
      };

      getUserByEmailUseCase.execute.mockResolvedValue(
        ResultFactory.failure(ErrorsEnum.UserNotFound),
      );

      const savedDonor: User = { id: '123', ...donorUser };
      const savedCompany: User = { id: '456', ...companyUser };

      userRepository.save
        .mockResolvedValueOnce(savedDonor)
        .mockResolvedValueOnce(savedCompany);

      const donorResult = await useCase.execute(donorUser);
      const companyResult = await useCase.execute(companyUser);

      expect(donorResult.isSuccess).toBe(true);
      expect(donorResult.value?.personType).toBe('DONOR');
      expect(companyResult.isSuccess).toBe(true);
      expect(companyResult.value?.personType).toBe('COMPANY');
    });

    it('should handle user creation without optional fields', async () => {
      const minimalUserData: Omit<User, 'id'> = {
        email: 'minimal@example.com',
        name: 'Minimal User',
        city: 'São Paulo',
        uf: 'SP',
        personType: 'DONOR',
      };

      const savedUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...minimalUserData,
      };

      getUserByEmailUseCase.execute.mockResolvedValue(
        ResultFactory.failure(ErrorsEnum.UserNotFound),
      );
      userRepository.save.mockResolvedValue(savedUser);

      const result = await useCase.execute(minimalUserData);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(savedUser);
      expect(result.value?.password).toBeUndefined();
      expect(result.value?.zipcode).toBeUndefined();
    });

    it('should handle different data formats', async () => {
      const testCases = [
        { uf: 'SP', email: 'test-sp@example.com', zipcode: '01234-567' },
        { uf: 'RJ', email: 'user.name@domain.co.uk', zipcode: '01234567' },
      ];

      getUserByEmailUseCase.execute.mockResolvedValue(
        ResultFactory.failure(ErrorsEnum.UserNotFound),
      );

      for (const testCase of testCases) {
        const userData: Omit<User, 'id'> = { ...validUserData, ...testCase };
        const savedUser: User = { id: 'test-id', ...userData };
        userRepository.save.mockResolvedValue(savedUser);

        const result = await useCase.execute(userData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.uf).toBe(testCase.uf);
        expect(result.value?.email).toBe(testCase.email);
      }
    });

    it('should handle repository errors gracefully', async () => {
      getUserByEmailUseCase.execute.mockResolvedValue(
        ResultFactory.failure(ErrorsEnum.UserNotFound),
      );
      userRepository.save.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(validUserData)).rejects.toThrow(
        'Database connection failed',
      );
      expect(getUserByEmailUseCase.execute).toHaveBeenCalledWith(
        validUserData.email,
      );
    });

    it('should handle getUserByEmailUseCase errors', async () => {
      getUserByEmailUseCase.execute.mockRejectedValue(
        new Error('Email service unavailable'),
      );

      await expect(useCase.execute(validUserData)).rejects.toThrow(
        'Email service unavailable',
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
