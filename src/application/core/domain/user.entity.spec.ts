import { User } from './user.entity';

describe('User Entity', () => {
  describe('User creation', () => {
    it('should create a user with all required properties', () => {
      const userData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'John Doe',
        city: 'São Paulo',
        uf: 'SP',
        zipcode: '01234-567',
        personType: 'DONOR',
      };

      const user = new User();
      Object.assign(user, userData);

      expect(user.id).toBe(userData.id);
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
      expect(user.name).toBe(userData.name);
      expect(user.city).toBe(userData.city);
      expect(user.uf).toBe(userData.uf);
      expect(user.zipcode).toBe(userData.zipcode);
      expect(user.personType).toBe(userData.personType);
    });

    it('should create a user without optional properties', () => {
      const userData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'John Doe',
        city: 'São Paulo',
        uf: 'SP',
        personType: 'COMPANY',
      };

      const user = new User();
      Object.assign(user, userData);

      expect(user.id).toBe(userData.id);
      expect(user.email).toBe(userData.email);
      expect(user.password).toBeUndefined();
      expect(user.name).toBe(userData.name);
      expect(user.city).toBe(userData.city);
      expect(user.uf).toBe(userData.uf);
      expect(user.zipcode).toBeUndefined();
      expect(user.personType).toBe(userData.personType);
    });

    it('should handle different person types', () => {
      const donorUser = new User();
      donorUser.personType = 'DONOR';

      const companyUser = new User();
      companyUser.personType = 'COMPANY';

      expect(donorUser.personType).toBe('DONOR');
      expect(companyUser.personType).toBe('COMPANY');
    });

    it('should handle different UF values', () => {
      const states = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO'];

      states.forEach((uf) => {
        const user = new User();
        user.uf = uf;
        expect(user.uf).toBe(uf);
      });
    });

    it('should handle email validation format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        const user = new User();
        user.email = email;
        expect(user.email).toBe(email);
      });
    });

    it('should handle zipcode with and without mask', () => {
      const user1 = new User();
      user1.zipcode = '01234-567';

      const user2 = new User();
      user2.zipcode = '01234567';

      expect(user1.zipcode).toBe('01234-567');
      expect(user2.zipcode).toBe('01234567');
    });
  });

  describe('User properties validation', () => {
    it('should allow empty password for certain operations', () => {
      const user = new User();
      user.password = undefined;

      expect(user.password).toBeUndefined();
    });

    it('should handle long names', () => {
      const user = new User();
      user.name = 'João da Silva Santos Oliveira Pereira';

      expect(user.name).toBe('João da Silva Santos Oliveira Pereira');
    });

    it('should handle city names with special characters', () => {
      const cities = [
        'São Paulo',
        'Ribeirão Preto',
        'Poços de Caldas',
        'Três Corações',
      ];

      cities.forEach((city) => {
        const user = new User();
        user.city = city;
        expect(user.city).toBe(city);
      });
    });
  });
});
