import { Test, TestingModule } from '@nestjs/testing';
import { CreateDonorUseCase } from './createDonor.useCase';
import { DonorRepositoryPort } from '../../out/donor-repository.port';
import { DONOR_REPOSITORY } from '../../../../constants';
import { Donor } from '../../../core/domain/donor.entity';

describe('CreateDonorUseCase', () => {
  let useCase: CreateDonorUseCase;
  let donorRepository: jest.Mocked<DonorRepositoryPort>;

  beforeEach(async () => {
    const mockDonorRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateDonorUseCase,
        {
          provide: DONOR_REPOSITORY,
          useValue: mockDonorRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateDonorUseCase>(CreateDonorUseCase);
    donorRepository = module.get(DONOR_REPOSITORY);
  });

  describe('execute', () => {
    const validDonorData: Omit<Donor, 'id'> = {
      cpf: '123.456.789-00',
      bloodType: 'O+',
      birthDate: new Date('1990-05-15'),
      fkUserId: '987e6543-e21b-34d5-a678-426614174111',
    };

    it('should create a new donor successfully', async () => {
      const savedDonor: Donor = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...validDonorData,
      };

      donorRepository.save.mockResolvedValue(savedDonor);

      const result = await useCase.execute(validDonorData);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(savedDonor);
      expect(donorRepository.save).toHaveBeenCalledWith(validDonorData);
    });

    it('should handle all blood types', async () => {
      const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

      for (const bloodType of bloodTypes) {
        const donorData: Omit<Donor, 'id'> = { ...validDonorData, bloodType };
        const savedDonor: Donor = { id: `donor-${bloodType}`, ...donorData };

        donorRepository.save.mockResolvedValue(savedDonor);

        const result = await useCase.execute(donorData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.bloodType).toBe(bloodType);
        expect(donorRepository.save).toHaveBeenCalledWith(donorData);
      }
    });

    it('should handle different CPF formats', async () => {
      const cpfFormats = [
        '123.456.789-00',
        '12345678900',
        '987.654.321-11',
        '98765432111',
      ];

      for (const cpf of cpfFormats) {
        const donorData: Omit<Donor, 'id'> = { ...validDonorData, cpf };
        const savedDonor: Donor = {
          id: `donor-${cpf.replace(/\D/g, '')}`,
          ...donorData,
        };

        donorRepository.save.mockResolvedValue(savedDonor);

        const result = await useCase.execute(donorData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.cpf).toBe(cpf);
      }
    });

    it('should handle different birth dates', async () => {
      const birthDates = [
        new Date('1980-01-01'),
        new Date('1995-12-31'),
        new Date('2000-06-15'),
        new Date('1975-03-20'),
        new Date('2005-09-10'), // Young donor
      ];

      for (const birthDate of birthDates) {
        const donorData: Omit<Donor, 'id'> = { ...validDonorData, birthDate };
        const savedDonor: Donor = {
          id: `donor-${birthDate.getFullYear()}`,
          ...donorData,
        };

        donorRepository.save.mockResolvedValue(savedDonor);

        const result = await useCase.execute(donorData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.birthDate).toBe(birthDate);
      }
    });

    it('should handle different user IDs', async () => {
      const userIds = [
        '123e4567-e89b-12d3-a456-426614174000',
        '987e6543-e21b-34d5-a678-426614174111',
        '456f7890-f12c-45e6-b789-426614174222',
        '789a0123-a34b-56c7-d890-426614174333',
      ];

      for (const fkUserId of userIds) {
        const donorData: Omit<Donor, 'id'> = { ...validDonorData, fkUserId };
        const savedDonor: Donor = {
          id: `donor-${fkUserId.slice(0, 8)}`,
          ...donorData,
        };

        donorRepository.save.mockResolvedValue(savedDonor);

        const result = await useCase.execute(donorData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.fkUserId).toBe(fkUserId);
      }
    });

    it('should handle universal donor blood type', async () => {
      const universalDonorData: Omit<Donor, 'id'> = {
        ...validDonorData,
        bloodType: 'O-',
      };

      const savedDonor: Donor = {
        id: 'universal-donor',
        ...universalDonorData,
      };
      donorRepository.save.mockResolvedValue(savedDonor);

      const result = await useCase.execute(universalDonorData);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.bloodType).toBe('O-');
    });

    it('should handle universal recipient blood type', async () => {
      const universalRecipientData: Omit<Donor, 'id'> = {
        ...validDonorData,
        bloodType: 'AB+',
      };

      const savedDonor: Donor = {
        id: 'universal-recipient',
        ...universalRecipientData,
      };
      donorRepository.save.mockResolvedValue(savedDonor);

      const result = await useCase.execute(universalRecipientData);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.bloodType).toBe('AB+');
    });

    it('should handle age-related scenarios', async () => {
      const today = new Date();

      // 18 years old (minimum age for donation)
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      );

      // 65 years old (maximum age for donation)
      const sixtyFiveYearsAgo = new Date(
        today.getFullYear() - 65,
        today.getMonth(),
        today.getDate(),
      );

      const youngDonorData: Omit<Donor, 'id'> = {
        ...validDonorData,
        birthDate: eighteenYearsAgo,
      };

      const seniorDonorData: Omit<Donor, 'id'> = {
        ...validDonorData,
        birthDate: sixtyFiveYearsAgo,
        fkUserId: '456f7890-f12c-45e6-b789-426614174222',
      };

      const youngSavedDonor: Donor = { id: 'young-donor', ...youngDonorData };
      const seniorSavedDonor: Donor = {
        id: 'senior-donor',
        ...seniorDonorData,
      };

      donorRepository.save
        .mockResolvedValueOnce(youngSavedDonor)
        .mockResolvedValueOnce(seniorSavedDonor);

      const youngResult = await useCase.execute(youngDonorData);
      const seniorResult = await useCase.execute(seniorDonorData);

      expect(youngResult.isSuccess).toBe(true);
      expect(youngResult.value?.birthDate).toBe(eighteenYearsAgo);
      expect(seniorResult.isSuccess).toBe(true);
      expect(seniorResult.value?.birthDate).toBe(sixtyFiveYearsAgo);
    });

    it('should handle repository errors gracefully', async () => {
      donorRepository.save.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(validDonorData)).rejects.toThrow(
        'Database connection failed',
      );
      expect(donorRepository.save).toHaveBeenCalledWith(validDonorData);
    });

    it('should handle edge case CPF values', async () => {
      const edgeCaseCpfs = [
        '000.000.000-00',
        '111.111.111-11',
        '999.999.999-99',
      ];

      for (const cpf of edgeCaseCpfs) {
        const donorData: Omit<Donor, 'id'> = { ...validDonorData, cpf };
        const savedDonor: Donor = {
          id: `edge-${cpf.replace(/\D/g, '')}`,
          ...donorData,
        };

        donorRepository.save.mockResolvedValue(savedDonor);

        const result = await useCase.execute(donorData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.cpf).toBe(cpf);
      }
    });

    it('should handle blood type compatibility scenarios', async () => {
      const compatibilityTests = [
        {
          bloodType: 'O-',
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        },
        { bloodType: 'O+', canDonateTo: ['A+', 'B+', 'AB+', 'O+'] },
        { bloodType: 'A-', canDonateTo: ['A+', 'A-', 'AB+', 'AB-'] },
        { bloodType: 'AB+', canDonateTo: ['AB+'] },
      ];

      for (const test of compatibilityTests) {
        const donorData: Omit<Donor, 'id'> = {
          ...validDonorData,
          bloodType: test.bloodType,
          fkUserId: `user-${test.bloodType.replace(/[+-]/g, '')}`,
        };

        const savedDonor: Donor = {
          id: `donor-${test.bloodType}`,
          ...donorData,
        };
        donorRepository.save.mockResolvedValue(savedDonor);

        const result = await useCase.execute(donorData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.bloodType).toBe(test.bloodType);
        // Note: Actual compatibility logic would be in a service, not the use case
      }
    });

    it('should handle concurrent donor creation', async () => {
      const donorDataList = Array(5)
        .fill(null)
        .map((_, index) => ({
          ...validDonorData,
          cpf: `123.456.789-0${index}`,
          fkUserId: `user-${index}`,
        }));

      const savedDonors = donorDataList.map((data, index) => ({
        id: `donor-${index}`,
        ...data,
      }));

      donorRepository.save
        .mockResolvedValueOnce(savedDonors[0])
        .mockResolvedValueOnce(savedDonors[1])
        .mockResolvedValueOnce(savedDonors[2])
        .mockResolvedValueOnce(savedDonors[3])
        .mockResolvedValueOnce(savedDonors[4]);

      const promises = donorDataList.map((data) => useCase.execute(data));
      const results = await Promise.all(promises);

      results.forEach((result, index) => {
        expect(result.isSuccess).toBe(true);
        expect(result.value?.cpf).toBe(donorDataList[index].cpf);
      });

      expect(donorRepository.save).toHaveBeenCalledTimes(5);
    });

    it('should handle birth date edge cases', async () => {
      const today = new Date();
      const leap = new Date(2000, 1, 29); // Leap year date
      const endOfYear = new Date(1999, 11, 31); // End of year
      const startOfYear = new Date(2000, 0, 1); // Start of year

      const edgeDates = [leap, endOfYear, startOfYear];

      for (const birthDate of edgeDates) {
        const donorData: Omit<Donor, 'id'> = {
          ...validDonorData,
          birthDate,
          fkUserId: `user-${birthDate.getTime()}`,
        };

        const savedDonor: Donor = {
          id: `donor-${birthDate.getTime()}`,
          ...donorData,
        };
        donorRepository.save.mockResolvedValue(savedDonor);

        const result = await useCase.execute(donorData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.birthDate).toBe(birthDate);
      }
    });
  });
});
