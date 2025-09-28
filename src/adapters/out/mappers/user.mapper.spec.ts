import { UserMapper } from './user.mapper';
import { User } from '../../../application/core/domain/user.entity';
import { Users } from '../domain/user.entity';

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('should map Users entity to User domain object with all properties', () => {
      const usersEntity = new Users();
      usersEntity.id = '123e4567-e89b-12d3-a456-426614174000';
      usersEntity.email = 'test@example.com';
      usersEntity.password = 'hashedPassword123';
      usersEntity.name = 'John Doe';
      usersEntity.city = 'São Paulo';
      usersEntity.uf = 'SP';
      usersEntity.zipcode = '01234-567';
      usersEntity.personType = 'DONOR';

      const domainUser = UserMapper.toDomain(usersEntity);

      expect(domainUser).toBeInstanceOf(Object);
      expect(domainUser.id).toBe(usersEntity.id);
      expect(domainUser.email).toBe(usersEntity.email);
      expect(domainUser.password).toBe(usersEntity.password);
      expect(domainUser.name).toBe(usersEntity.name);
      expect(domainUser.city).toBe(usersEntity.city);
      expect(domainUser.uf).toBe(usersEntity.uf);
      expect(domainUser.zipcode).toBe(usersEntity.zipcode);
      expect(domainUser.personType).toBe(usersEntity.personType);
    });

    it('should map Users entity to User domain object without optional properties', () => {
      const usersEntity = new Users();
      usersEntity.id = '123e4567-e89b-12d3-a456-426614174000';
      usersEntity.email = 'test@example.com';
      usersEntity.name = 'John Doe';
      usersEntity.city = 'São Paulo';
      usersEntity.uf = 'SP';
      usersEntity.personType = 'COMPANY';

      const domainUser = UserMapper.toDomain(usersEntity);

      expect(domainUser.id).toBe(usersEntity.id);
      expect(domainUser.email).toBe(usersEntity.email);
      expect(domainUser.password).toBeUndefined();
      expect(domainUser.name).toBe(usersEntity.name);
      expect(domainUser.city).toBe(usersEntity.city);
      expect(domainUser.uf).toBe(usersEntity.uf);
      expect(domainUser.zipcode).toBeUndefined();
      expect(domainUser.personType).toBe(usersEntity.personType);
    });

    it('should handle different person types', () => {
      const donorEntity = new Users();
      donorEntity.personType = 'DONOR';

      const companyEntity = new Users();
      companyEntity.personType = 'COMPANY';

      const donorDomain = UserMapper.toDomain(donorEntity);
      const companyDomain = UserMapper.toDomain(companyEntity);

      expect(donorDomain.personType).toBe('DONOR');
      expect(companyDomain.personType).toBe('COMPANY');
    });
  });

  describe('toPersistence', () => {
    it('should map User domain object to Users entity with all properties', () => {
      const domainUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'John Doe',
        city: 'São Paulo',
        uf: 'SP',
        zipcode: '01234-567',
        personType: 'DONOR',
      };

      const persistenceUser = UserMapper.toPersistence(domainUser);

      expect(persistenceUser).toBeInstanceOf(Users);
      expect(persistenceUser.email).toBe(domainUser.email);
      expect(persistenceUser.password).toBe(domainUser.password);
      expect(persistenceUser.name).toBe(domainUser.name);
      expect(persistenceUser.city).toBe(domainUser.city);
      expect(persistenceUser.uf).toBe(domainUser.uf);
      expect(persistenceUser.zipcode).toBe(domainUser.zipcode);
      expect(persistenceUser.personType).toBe(domainUser.personType);
    });

    it('should map User domain object to Users entity without optional properties', () => {
      const domainUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'John Doe',
        city: 'São Paulo',
        uf: 'SP',
        personType: 'COMPANY',
      };

      const persistenceUser = UserMapper.toPersistence(domainUser);

      expect(persistenceUser.email).toBe(domainUser.email);
      expect(persistenceUser.password).toBeUndefined();
      expect(persistenceUser.name).toBe(domainUser.name);
      expect(persistenceUser.city).toBe(domainUser.city);
      expect(persistenceUser.uf).toBe(domainUser.uf);
      expect(persistenceUser.zipcode).toBe(''); // Default empty string
      expect(persistenceUser.personType).toBe(domainUser.personType);
    });

    it('should handle zipcode default value when undefined', () => {
      const domainUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'John Doe',
        city: 'São Paulo',
        uf: 'SP',
        personType: 'DONOR',
        zipcode: undefined,
      };

      const persistenceUser = UserMapper.toPersistence(domainUser);

      expect(persistenceUser.zipcode).toBe('');
    });

    it('should preserve zipcode when provided', () => {
      const domainUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'John Doe',
        city: 'São Paulo',
        uf: 'SP',
        personType: 'DONOR',
        zipcode: '01234-567',
      };

      const persistenceUser = UserMapper.toPersistence(domainUser);

      expect(persistenceUser.zipcode).toBe('01234-567');
    });

    it('should handle different person types in persistence', () => {
      const donorUser: User = {
        id: '1',
        email: 'donor@test.com',
        name: 'Donor User',
        city: 'City',
        uf: 'SP',
        personType: 'DONOR',
      };

      const companyUser: User = {
        id: '2',
        email: 'company@test.com',
        name: 'Company User',
        city: 'City',
        uf: 'SP',
        personType: 'COMPANY',
      };

      const donorPersistence = UserMapper.toPersistence(donorUser);
      const companyPersistence = UserMapper.toPersistence(companyUser);

      expect(donorPersistence.personType).toBe('DONOR');
      expect(companyPersistence.personType).toBe('COMPANY');
    });
  });

  describe('bidirectional mapping', () => {
    it('should maintain data integrity in round-trip mapping', () => {
      const originalDomain: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'John Doe',
        city: 'São Paulo',
        uf: 'SP',
        zipcode: '01234-567',
        personType: 'DONOR',
      };

      const persistence = UserMapper.toPersistence(originalDomain);
      persistence.id = originalDomain.id; // Simulate database ID assignment
      const backToDomain = UserMapper.toDomain(persistence);

      expect(backToDomain.id).toBe(originalDomain.id);
      expect(backToDomain.email).toBe(originalDomain.email);
      expect(backToDomain.password).toBe(originalDomain.password);
      expect(backToDomain.name).toBe(originalDomain.name);
      expect(backToDomain.city).toBe(originalDomain.city);
      expect(backToDomain.uf).toBe(originalDomain.uf);
      expect(backToDomain.zipcode).toBe(originalDomain.zipcode);
      expect(backToDomain.personType).toBe(originalDomain.personType);
    });

    it('should handle round-trip mapping without optional fields', () => {
      const originalDomain: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'John Doe',
        city: 'São Paulo',
        uf: 'SP',
        personType: 'COMPANY',
      };

      const persistence = UserMapper.toPersistence(originalDomain);
      persistence.id = originalDomain.id;
      const backToDomain = UserMapper.toDomain(persistence);

      expect(backToDomain.id).toBe(originalDomain.id);
      expect(backToDomain.email).toBe(originalDomain.email);
      expect(backToDomain.name).toBe(originalDomain.name);
      expect(backToDomain.city).toBe(originalDomain.city);
      expect(backToDomain.uf).toBe(originalDomain.uf);
      expect(backToDomain.personType).toBe(originalDomain.personType);
      expect(backToDomain.zipcode).toBe(''); // Default value from toPersistence
    });
  });
});
