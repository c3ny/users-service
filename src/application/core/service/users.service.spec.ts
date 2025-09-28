import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { GetUserUseCase } from '../../ports/in/user/getUser.useCase';
import { CreateUserUseCase } from '../../ports/in/user/createUser.useCase';
import { HashStringUseCase } from '../../../modules/Hash/application/ports/in/hashString.useCase';
import { CompareHashUseCase } from '../../../modules/Hash/application/ports/in/compareHash.useCase';
import { GetUserByEmailUseCase } from '../../ports/in/user/getUserByEmail.useCase';
import { ChangePasswordUseCase } from '../../ports/in/user/changePassword.useCase';
import { CreateDonorUseCase } from '../../ports/in/donor/createDonor.useCase';
import { CreateCompanyUseCase } from '../../ports/in/company/createCompany.useCase';
import { User } from '../domain/user.entity';
import { CreateUserRequest, PersonType } from '../../types/user.types';
import { ResultFactory } from '../../types/result.types';
import { ErrorsEnum } from '../errors/errors.enum';

describe('UsersService', () => {
  let service: UsersService;
  let getUserUseCase: jest.Mocked<GetUserUseCase>;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let hashStringUseCase: jest.Mocked<HashStringUseCase>;
  let compareHashUseCase: jest.Mocked<CompareHashUseCase>;
  let getUserByEmailUseCase: jest.Mocked<GetUserByEmailUseCase>;
  let changePasswordUseCase: jest.Mocked<ChangePasswordUseCase>;
  let createDonorUseCase: jest.Mocked<CreateDonorUseCase>;
  let createCompanyUseCase: jest.Mocked<CreateCompanyUseCase>;

  beforeEach(async () => {
    const mockGetUserUseCase = { execute: jest.fn() };
    const mockCreateUserUseCase = { execute: jest.fn() };
    const mockHashStringUseCase = { execute: jest.fn() };
    const mockCompareHashUseCase = { execute: jest.fn() };
    const mockGetUserByEmailUseCase = { execute: jest.fn() };
    const mockChangePasswordUseCase = { execute: jest.fn() };
    const mockCreateDonorUseCase = { execute: jest.fn() };
    const mockCreateCompanyUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: GetUserUseCase, useValue: mockGetUserUseCase },
        { provide: CreateUserUseCase, useValue: mockCreateUserUseCase },
        { provide: HashStringUseCase, useValue: mockHashStringUseCase },
        { provide: CompareHashUseCase, useValue: mockCompareHashUseCase },
        { provide: GetUserByEmailUseCase, useValue: mockGetUserByEmailUseCase },
        { provide: ChangePasswordUseCase, useValue: mockChangePasswordUseCase },
        { provide: CreateDonorUseCase, useValue: mockCreateDonorUseCase },
        { provide: CreateCompanyUseCase, useValue: mockCreateCompanyUseCase },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    getUserUseCase = module.get(GetUserUseCase);
    createUserUseCase = module.get(CreateUserUseCase);
    hashStringUseCase = module.get(HashStringUseCase);
    compareHashUseCase = module.get(CompareHashUseCase);
    getUserByEmailUseCase = module.get(GetUserByEmailUseCase);
    changePasswordUseCase = module.get(ChangePasswordUseCase);
    createDonorUseCase = module.get(CreateDonorUseCase);
    createCompanyUseCase = module.get(CreateCompanyUseCase);
  });

  describe('getUserById', () => {
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

    it('should return user without password when user exists', async () => {
      getUserUseCase.execute.mockResolvedValue(ResultFactory.success(mockUser));

      const result = await service.getUserById(mockUser.id);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.password).toBeUndefined();
      expect(result.value?.id).toBe(mockUser.id);
      expect(result.value?.email).toBe(mockUser.email);
      expect(getUserUseCase.execute).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return failure when user does not exist', async () => {
      getUserUseCase.execute.mockResolvedValue(
        ResultFactory.failure(ErrorsEnum.UserNotFoundError),
      );

      const result = await service.getUserById('nonexistent-id');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserNotFoundError);
    });

    it('should handle different user types', async () => {
      const donorUser = { ...mockUser, personType: 'DONOR' };
      const companyUser = { ...mockUser, personType: 'COMPANY' };

      getUserUseCase.execute
        .mockResolvedValueOnce(ResultFactory.success(donorUser))
        .mockResolvedValueOnce(ResultFactory.success(companyUser));

      const donorResult = await service.getUserById('donor-id');
      const companyResult = await service.getUserById('company-id');

      expect(donorResult.isSuccess).toBe(true);
      expect(donorResult.value?.personType).toBe('DONOR');
      expect(companyResult.isSuccess).toBe(true);
      expect(companyResult.value?.personType).toBe('COMPANY');
    });
  });

  describe('createUser', () => {
    const donorRequest: CreateUserRequest = {
      email: 'donor@example.com',
      password: 'plainPassword123',
      name: 'John Donor',
      city: 'São Paulo',
      uf: 'SP',
      zipcode: '01234-567',
      personType: PersonType.DONOR,
      cpf: '123.456.789-00',
      bloodType: 'O+',
      birthDate: new Date('1990-05-15'),
    };

    const companyRequest: CreateUserRequest = {
      email: 'company@example.com',
      password: 'plainPassword123',
      name: 'Hospital Company',
      city: 'São Paulo',
      uf: 'SP',
      zipcode: '01234-567',
      personType: PersonType.COMPANY,
      cnpj: '12.345.678/0001-90',
      institutionName: 'Hospital São Lucas',
      cnes: '1234567',
    };

    it('should create donor user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const createdUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: donorRequest.email,
        password: hashedPassword,
        name: donorRequest.name,
        city: donorRequest.city,
        uf: donorRequest.uf,
        zipcode: donorRequest.zipcode,
        personType: donorRequest.personType,
      };

      hashStringUseCase.execute.mockReturnValue(hashedPassword);
      createUserUseCase.execute.mockResolvedValue(
        ResultFactory.success(createdUser),
      );
      createDonorUseCase.execute.mockResolvedValue(
        ResultFactory.success({
          id: 'donor-id',
          cpf: donorRequest.cpf,
          bloodType: donorRequest.bloodType,
          birthDate: donorRequest.birthDate,
          fkUserId: createdUser.id,
        }),
      );

      const result = await service.createUser(donorRequest);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(createdUser);
      expect(hashStringUseCase.execute).toHaveBeenCalledWith(
        'plainPassword123',
      );
      expect(createUserUseCase.execute).toHaveBeenCalledWith({
        ...donorRequest,
        password: hashedPassword,
      });
      expect(createDonorUseCase.execute).toHaveBeenCalledWith({
        cpf: donorRequest.cpf,
        bloodType: donorRequest.bloodType,
        birthDate: donorRequest.birthDate,
        fkUserId: createdUser.id,
      });
    });

    it('should create company user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const createdUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: companyRequest.email,
        password: hashedPassword,
        name: companyRequest.name,
        city: companyRequest.city,
        uf: companyRequest.uf,
        zipcode: companyRequest.zipcode,
        personType: companyRequest.personType,
      };

      hashStringUseCase.execute.mockReturnValue(hashedPassword);
      createUserUseCase.execute.mockResolvedValue(
        ResultFactory.success(createdUser),
      );
      createCompanyUseCase.execute.mockResolvedValue(
        ResultFactory.success({
          id: 'company-id',
          cnpj: companyRequest.cnpj,
          institutionName: companyRequest.institutionName,
          cnes: companyRequest.cnes,
          fkUserId: createdUser.id,
        }),
      );

      const result = await service.createUser(companyRequest);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(createdUser);
      expect(createCompanyUseCase.execute).toHaveBeenCalledWith({
        cnpj: companyRequest.cnpj,
        institutionName: companyRequest.institutionName,
        cnes: companyRequest.cnes,
        fkUserId: createdUser.id,
      });
    });

    it('should return partial success when user is created but donor creation fails', async () => {
      const hashedPassword = 'hashedPassword123';
      const createdUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: donorRequest.email,
        password: hashedPassword,
        name: donorRequest.name,
        city: donorRequest.city,
        uf: donorRequest.uf,
        zipcode: donorRequest.zipcode,
        personType: donorRequest.personType,
      };

      hashStringUseCase.execute.mockReturnValue(hashedPassword);
      createUserUseCase.execute.mockResolvedValue(
        ResultFactory.success(createdUser),
      );
      createDonorUseCase.execute.mockResolvedValue(
        ResultFactory.failure(ErrorsEnum.DonorAlreadyExists),
      );

      const result = await service.createUser(donorRequest);

      expect(result.isSuccess).toBe(true);
      expect(result.isPartialSuccess).toBe(true);
      expect(result.value).toEqual(createdUser);
    });

    it('should return failure when user creation fails', async () => {
      const hashedPassword = 'hashedPassword123';

      hashStringUseCase.execute.mockReturnValue(hashedPassword);
      createUserUseCase.execute.mockResolvedValue(
        ResultFactory.failure(ErrorsEnum.UserAlreadyExists),
      );

      const result = await service.createUser(donorRequest);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserAlreadyExists);
      expect(createDonorUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return failure when personType is missing', async () => {
      const invalidRequest = { ...donorRequest, personType: undefined as any };
      const hashedPassword = 'hashedPassword123';
      const createdUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: invalidRequest.email,
        password: hashedPassword,
        name: invalidRequest.name,
        city: invalidRequest.city,
        uf: invalidRequest.uf,
        zipcode: invalidRequest.zipcode,
        personType: invalidRequest.personType,
      };

      hashStringUseCase.execute.mockReturnValue(hashedPassword);
      createUserUseCase.execute.mockResolvedValue(
        ResultFactory.success(createdUser),
      );

      const result = await service.createUser(invalidRequest);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserNotFoundError);
    });

    it('should handle empty password', async () => {
      const requestWithoutPassword = { ...donorRequest, password: undefined };
      const hashedPassword = 'hashedEmptyString';
      const createdUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: requestWithoutPassword.email,
        password: hashedPassword,
        name: requestWithoutPassword.name,
        city: requestWithoutPassword.city,
        uf: requestWithoutPassword.uf,
        zipcode: requestWithoutPassword.zipcode,
        personType: requestWithoutPassword.personType,
      };

      hashStringUseCase.execute.mockReturnValue(hashedPassword);
      createUserUseCase.execute.mockResolvedValue(
        ResultFactory.success(createdUser),
      );
      createDonorUseCase.execute.mockResolvedValue(
        ResultFactory.success({
          id: 'donor-id',
          cpf: donorRequest.cpf,
          bloodType: donorRequest.bloodType,
          birthDate: donorRequest.birthDate,
          fkUserId: createdUser.id,
        }),
      );

      const result = await service.createUser(requestWithoutPassword);

      expect(result.isSuccess).toBe(true);
      expect(hashStringUseCase.execute).toHaveBeenCalledWith('');
    });
  });

  describe('authenticate', () => {
    const authRequest = {
      email: 'test@example.com',
      password: 'plainPassword123',
    };

    const mockUser: User = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: authRequest.email,
      password: 'hashedPassword123',
      name: 'John Doe',
      city: 'São Paulo',
      uf: 'SP',
      personType: 'DONOR',
    };

    it('should authenticate user successfully with correct credentials', async () => {
      getUserByEmailUseCase.execute.mockResolvedValue(
        ResultFactory.success(mockUser),
      );
      compareHashUseCase.execute.mockReturnValue(true);

      const result = await service.authenticate(authRequest);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.password).toBeUndefined();
      expect(result.value?.email).toBe(authRequest.email);
      expect(getUserByEmailUseCase.execute).toHaveBeenCalledWith(
        authRequest.email,
      );
      expect(compareHashUseCase.execute).toHaveBeenCalledWith({
        password: authRequest.password,
        hash: 'hashedPassword123',
      });
    });

    it('should return failure when user is not found', async () => {
      getUserByEmailUseCase.execute.mockResolvedValue(
        ResultFactory.failure(ErrorsEnum.UserNotFound),
      );

      const result = await service.authenticate(authRequest);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserNotFound);
      expect(compareHashUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return failure when password is incorrect', async () => {
      getUserByEmailUseCase.execute.mockResolvedValue(
        ResultFactory.success(mockUser),
      );
      compareHashUseCase.execute.mockReturnValue(false);

      const result = await service.authenticate(authRequest);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.InvalidPassword);
    });

    it('should handle empty password in authentication', async () => {
      const emptyPasswordRequest = { ...authRequest, password: undefined };

      getUserByEmailUseCase.execute.mockResolvedValue(
        ResultFactory.success(mockUser),
      );
      compareHashUseCase.execute.mockReturnValue(false);

      const result = await service.authenticate(emptyPasswordRequest);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.InvalidPassword);
      expect(compareHashUseCase.execute).toHaveBeenCalledWith({
        password: '',
        hash: '',
      });
    });

    it('should handle user without password hash', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };

      getUserByEmailUseCase.execute.mockResolvedValue(
        ResultFactory.success(userWithoutPassword),
      );
      compareHashUseCase.execute.mockReturnValue(false);

      const result = await service.authenticate(authRequest);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.InvalidPassword);
      expect(compareHashUseCase.execute).toHaveBeenCalledWith({
        password: authRequest.password,
        hash: '',
      });
    });
  });

  describe('changePassword', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const passwords = { old: 'oldPassword123', new: 'newPassword456' };

    const mockUser: User = {
      id: userId,
      email: 'test@example.com',
      password: 'hashedOldPassword',
      name: 'John Doe',
      city: 'São Paulo',
      uf: 'SP',
      personType: 'DONOR',
    };

    it('should change password successfully with correct old password', async () => {
      const hashedNewPassword = 'hashedNewPassword456';
      const updatedUser = { ...mockUser, password: hashedNewPassword };

      getUserUseCase.execute.mockResolvedValue(ResultFactory.success(mockUser));
      compareHashUseCase.execute.mockReturnValue(true);
      hashStringUseCase.execute.mockReturnValue(hashedNewPassword);
      changePasswordUseCase.execute.mockResolvedValue(
        ResultFactory.success(updatedUser),
      );

      const result = await service.changePassword(userId, passwords);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(updatedUser);
      expect(getUserUseCase.execute).toHaveBeenCalledWith(userId);
      expect(compareHashUseCase.execute).toHaveBeenCalledWith({
        password: passwords.old,
        hash: mockUser.password,
      });
      expect(hashStringUseCase.execute).toHaveBeenCalledWith(passwords.new);
      expect(changePasswordUseCase.execute).toHaveBeenCalledWith({
        id: userId,
        newPassword: hashedNewPassword,
      });
    });

    it('should return failure when user is not found', async () => {
      getUserUseCase.execute.mockResolvedValue(
        ResultFactory.failure(ErrorsEnum.UserNotFoundError),
      );

      const result = await service.changePassword(userId, passwords);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserNotFoundError);
      expect(compareHashUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return failure when old password is incorrect', async () => {
      getUserUseCase.execute.mockResolvedValue(ResultFactory.success(mockUser));
      compareHashUseCase.execute.mockReturnValue(false);

      const result = await service.changePassword(userId, passwords);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.InvalidPassword);
      expect(hashStringUseCase.execute).not.toHaveBeenCalled();
      expect(changePasswordUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return failure when password change operation fails', async () => {
      const hashedNewPassword = 'hashedNewPassword456';

      getUserUseCase.execute.mockResolvedValue(ResultFactory.success(mockUser));
      compareHashUseCase.execute.mockReturnValue(true);
      hashStringUseCase.execute.mockReturnValue(hashedNewPassword);
      changePasswordUseCase.execute.mockResolvedValue(
        ResultFactory.failure(ErrorsEnum.UserNotFoundError),
      );

      const result = await service.changePassword(userId, passwords);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.UserNotFoundError);
    });

    it('should handle user without password hash', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };

      getUserUseCase.execute.mockResolvedValue(
        ResultFactory.success(userWithoutPassword),
      );
      compareHashUseCase.execute.mockReturnValue(false);

      const result = await service.changePassword(userId, passwords);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.InvalidPassword);
      expect(compareHashUseCase.execute).toHaveBeenCalledWith({
        password: passwords.old,
        hash: '',
      });
    });
  });
});
