import { DonorMapper, DonorPersistence } from './donor.mapper';
import { Donor } from '../../../application/core/domain/donor.entity';

describe('DonorMapper', () => {
  describe('toDomain', () => {
    it('should map donor persistence object to Donor domain object with all properties', () => {
      const donorPersistence = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        cpf: '123.456.789-00',
        bloodType: 'O+',
        birthDate: new Date('1990-05-15'),
        fkUserId: '987e6543-e21b-34d5-a678-426614174111',
      };

      const domainDonor = DonorMapper.toDomain(donorPersistence);

      expect(domainDonor).toBeInstanceOf(Object);
      expect(domainDonor.id).toBe(donorPersistence.id);
      expect(domainDonor.cpf).toBe(donorPersistence.cpf);
      expect(domainDonor.bloodType).toBe(donorPersistence.bloodType);
      expect(domainDonor.birthDate).toBe(donorPersistence.birthDate);
      expect(domainDonor.fkUserId).toBe(donorPersistence.fkUserId);
    });

    it('should handle different blood types', () => {
      const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

      bloodTypes.forEach((bloodType) => {
        const donorPersistence = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          cpf: '123.456.789-00',
          bloodType,
          birthDate: new Date('1990-05-15'),
          fkUserId: '987e6543-e21b-34d5-a678-426614174111',
        };

        const domainDonor = DonorMapper.toDomain(donorPersistence);
        expect(domainDonor.bloodType).toBe(bloodType);
      });
    });

    it('should handle different CPF formats', () => {
      const cpfFormats = ['123.456.789-00', '12345678900', '987.654.321-11'];

      cpfFormats.forEach((cpf) => {
        const donorPersistence = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          cpf,
          bloodType: 'O+',
          birthDate: new Date('1990-05-15'),
          fkUserId: '987e6543-e21b-34d5-a678-426614174111',
        };

        const domainDonor = DonorMapper.toDomain(donorPersistence);
        expect(domainDonor.cpf).toBe(cpf);
      });
    });
  });

  describe('toPersistence', () => {
    it('should map Donor domain object to persistence format with user relation', () => {
      const domainDonor: Omit<Donor, 'id'> = {
        cpf: '123.456.789-00',
        bloodType: 'O+',
        birthDate: new Date('1990-05-15'),
        fkUserId: '987e6543-e21b-34d5-a678-426614174111',
      };

      const persistenceDonor = DonorMapper.toPersistence(domainDonor);

      expect(persistenceDonor.cpf).toBe(domainDonor.cpf);
      expect(persistenceDonor.bloodType).toBe(domainDonor.bloodType);
      expect(persistenceDonor.birthDate).toBe(domainDonor.birthDate);
      expect(persistenceDonor.user).toEqual({ id: domainDonor.fkUserId });
      expect(persistenceDonor.user.id).toBe(domainDonor.fkUserId);
    });

    it('should handle all blood types in persistence mapping', () => {
      const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

      bloodTypes.forEach((bloodType) => {
        const domainDonor: Omit<Donor, 'id'> = {
          cpf: '123.456.789-00',
          bloodType,
          birthDate: new Date('1990-05-15'),
          fkUserId: '987e6543-e21b-34d5-a678-426614174111',
        };

        const persistenceDonor = DonorMapper.toPersistence(domainDonor);
        expect(persistenceDonor.bloodType).toBe(bloodType);
      });
    });

    it('should handle different birth dates', () => {
      const birthDates = [
        new Date('1980-01-01'),
        new Date('1995-12-31'),
        new Date('2000-06-15'),
        new Date('1975-03-20'),
      ];

      birthDates.forEach((birthDate) => {
        const domainDonor: Omit<Donor, 'id'> = {
          cpf: '123.456.789-00',
          bloodType: 'B+',
          birthDate,
          fkUserId: '987e6543-e21b-34d5-a678-426614174111',
        };

        const persistenceDonor = DonorMapper.toPersistence(domainDonor);
        expect(persistenceDonor.birthDate).toBe(birthDate);
      });
    });

    it('should properly map user foreign key relationship', () => {
      const userIds = [
        '123e4567-e89b-12d3-a456-426614174000',
        '987e6543-e21b-34d5-a678-426614174111',
        '456f7890-f12c-45e6-b789-426614174222',
      ];

      userIds.forEach((userId) => {
        const domainDonor: Omit<Donor, 'id'> = {
          cpf: '123.456.789-00',
          bloodType: 'AB-',
          birthDate: new Date('1990-05-15'),
          fkUserId: userId,
        };

        const persistenceDonor = DonorMapper.toPersistence(domainDonor);
        expect(persistenceDonor.user.id).toBe(userId);
      });
    });
  });

  describe('type safety', () => {
    it('should ensure DonorPersistence type excludes id and fkUserId', () => {
      const persistenceData: DonorPersistence = {
        cpf: '123.456.789-00',
        bloodType: 'O+',
        birthDate: new Date('1990-05-15'),
        user: { id: '987e6543-e21b-34d5-a678-426614174111' },
      };

      // This should compile without errors
      expect(persistenceData.cpf).toBeDefined();
      expect(persistenceData.bloodType).toBeDefined();
      expect(persistenceData.birthDate).toBeDefined();
      expect(persistenceData.user).toBeDefined();
      expect(persistenceData.user.id).toBeDefined();
    });

    it('should handle edge cases in mapping', () => {
      const edgeCaseDonor = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        cpf: '000.000.000-00',
        bloodType: '',
        birthDate: new Date('1900-01-01'),
        fkUserId: '000e0000-e00b-00d0-a000-000000000000',
      };

      const domainDonor = DonorMapper.toDomain(edgeCaseDonor);
      expect(domainDonor.cpf).toBe('000.000.000-00');
      expect(domainDonor.bloodType).toBe(''); // Empty string should be preserved
      expect(domainDonor.birthDate).toEqual(new Date('1900-01-01'));
    });
  });

  describe('business logic validation', () => {
    it('should handle universal donor blood type', () => {
      const universalDonor = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        cpf: '123.456.789-00',
        bloodType: 'O-',
        birthDate: new Date('1990-05-15'),
        fkUserId: '987e6543-e21b-34d5-a678-426614174111',
      };

      const domainDonor = DonorMapper.toDomain(universalDonor);
      expect(domainDonor.bloodType).toBe('O-');
    });

    it('should handle universal recipient blood type', () => {
      const universalRecipient = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        cpf: '123.456.789-00',
        bloodType: 'AB+',
        birthDate: new Date('1990-05-15'),
        fkUserId: '987e6543-e21b-34d5-a678-426614174111',
      };

      const domainDonor = DonorMapper.toDomain(universalRecipient);
      expect(domainDonor.bloodType).toBe('AB+');
    });

    it('should handle age-related birth dates', () => {
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      );
      const sixtyYearsAgo = new Date(
        today.getFullYear() - 60,
        today.getMonth(),
        today.getDate(),
      );

      const youngDonor = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        cpf: '123.456.789-00',
        bloodType: 'A+',
        birthDate: eighteenYearsAgo,
        fkUserId: '987e6543-e21b-34d5-a678-426614174111',
      };

      const olderDonor = {
        id: '456e7890-e12c-34d5-a678-426614174222',
        cpf: '987.654.321-11',
        bloodType: 'B-',
        birthDate: sixtyYearsAgo,
        fkUserId: '987e6543-e21b-34d5-a678-426614174111',
      };

      const youngDomainDonor = DonorMapper.toDomain(youngDonor);
      const olderDomainDonor = DonorMapper.toDomain(olderDonor);

      expect(youngDomainDonor.birthDate).toEqual(eighteenYearsAgo);
      expect(olderDomainDonor.birthDate).toEqual(sixtyYearsAgo);
    });
  });
});
