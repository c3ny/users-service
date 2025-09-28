import { Donor } from './donor.entity';

describe('Donor Entity', () => {
  describe('Donor creation', () => {
    it('should create a donor with all required properties', () => {
      const donorData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        cpf: '123.456.789-00',
        bloodType: 'O+',
        birthDate: new Date('1990-05-15'),
        fkUserId: '987e6543-e21b-34d5-a678-426614174111',
      };

      const donor = new Donor();
      Object.assign(donor, donorData);

      expect(donor.id).toBe(donorData.id);
      expect(donor.cpf).toBe(donorData.cpf);
      expect(donor.bloodType).toBe(donorData.bloodType);
      expect(donor.birthDate).toBe(donorData.birthDate);
      expect(donor.fkUserId).toBe(donorData.fkUserId);
    });

    it('should handle CPF with different formats', () => {
      const cpfFormats = ['123.456.789-00', '12345678900', '123 456 789 00'];

      cpfFormats.forEach((cpf) => {
        const donor = new Donor();
        donor.cpf = cpf;
        expect(donor.cpf).toBe(cpf);
      });
    });

    it('should handle all blood types', () => {
      const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

      bloodTypes.forEach((bloodType) => {
        const donor = new Donor();
        donor.bloodType = bloodType;
        expect(donor.bloodType).toBe(bloodType);
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
        const donor = new Donor();
        donor.birthDate = birthDate;
        expect(donor.birthDate).toBe(birthDate);
      });
    });

    it('should handle foreign key relationships', () => {
      const userIds = [
        '123e4567-e89b-12d3-a456-426614174000',
        '987e6543-e21b-34d5-a678-426614174111',
        '456f7890-f12c-45e6-b789-426614174222',
      ];

      userIds.forEach((userId) => {
        const donor = new Donor();
        donor.fkUserId = userId;
        expect(donor.fkUserId).toBe(userId);
      });
    });
  });

  describe('Blood type validation', () => {
    it('should handle positive blood types', () => {
      const positiveTypes = ['A+', 'B+', 'AB+', 'O+'];

      positiveTypes.forEach((bloodType) => {
        const donor = new Donor();
        donor.bloodType = bloodType;
        expect(donor.bloodType).toContain('+');
        expect(donor.bloodType).toBe(bloodType);
      });
    });

    it('should handle negative blood types', () => {
      const negativeTypes = ['A-', 'B-', 'AB-', 'O-'];

      negativeTypes.forEach((bloodType) => {
        const donor = new Donor();
        donor.bloodType = bloodType;
        expect(donor.bloodType).toContain('-');
        expect(donor.bloodType).toBe(bloodType);
      });
    });

    it('should handle universal donor', () => {
      const donor = new Donor();
      donor.bloodType = 'O-';

      expect(donor.bloodType).toBe('O-');
    });

    it('should handle universal recipient', () => {
      const donor = new Donor();
      donor.bloodType = 'AB+';

      expect(donor.bloodType).toBe('AB+');
    });
  });

  describe('Age calculation scenarios', () => {
    it('should handle donors of legal age', () => {
      const legalAge = new Date();
      legalAge.setFullYear(legalAge.getFullYear() - 18); // 18 years ago

      const donor = new Donor();
      donor.birthDate = legalAge;

      expect(donor.birthDate).toBe(legalAge);
    });

    it('should handle senior donors', () => {
      const seniorAge = new Date();
      seniorAge.setFullYear(seniorAge.getFullYear() - 65); // 65 years ago

      const donor = new Donor();
      donor.birthDate = seniorAge;

      expect(donor.birthDate).toBe(seniorAge);
    });

    it('should handle middle-aged donors', () => {
      const middleAge = new Date();
      middleAge.setFullYear(middleAge.getFullYear() - 35); // 35 years ago

      const donor = new Donor();
      donor.birthDate = middleAge;

      expect(donor.birthDate).toBe(middleAge);
    });
  });

  describe('Donor business rules', () => {
    it('should maintain referential integrity with user', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const donor = new Donor();
      donor.fkUserId = userId;

      expect(donor.fkUserId).toBe(userId);
      expect(donor.fkUserId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should handle CPF validation format', () => {
      const validCpfs = ['123.456.789-00', '987.654.321-11', '111.222.333-44'];

      validCpfs.forEach((cpf) => {
        const donor = new Donor();
        donor.cpf = cpf;
        expect(donor.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
      });
    });

    it('should handle birth date edge cases', () => {
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

      const youngDonor = new Donor();
      youngDonor.birthDate = eighteenYearsAgo;

      const olderDonor = new Donor();
      olderDonor.birthDate = sixtyYearsAgo;

      expect(youngDonor.birthDate).toBe(eighteenYearsAgo);
      expect(olderDonor.birthDate).toBe(sixtyYearsAgo);
    });

    it('should handle different blood type combinations for compatibility', () => {
      const compatibilityTests = [
        {
          donor: 'O-',
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        },
        { donor: 'O+', canDonateTo: ['A+', 'B+', 'AB+', 'O+'] },
        { donor: 'A-', canDonateTo: ['A+', 'A-', 'AB+', 'AB-'] },
        { donor: 'AB+', canDonateTo: ['AB+'] },
      ];

      compatibilityTests.forEach((test) => {
        const donor = new Donor();
        donor.bloodType = test.donor;
        expect(donor.bloodType).toBe(test.donor);
        // Note: Compatibility logic would be in a service, not the entity
      });
    });
  });
});
