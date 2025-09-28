import { Test, TestingModule } from '@nestjs/testing';
import { CreateCompanyUseCase } from './createCompany.useCase';
import { CompanyRepositoryPort } from '../../out/company-repository.port';
import { COMPANY_REPOSITORY } from '../../../../constants';
import { Company } from '../../../core/domain/company.entity';
import { ErrorsEnum } from '../../../core/errors/errors.enum';

describe('CreateCompanyUseCase', () => {
  let useCase: CreateCompanyUseCase;
  let companyRepository: jest.Mocked<CompanyRepositoryPort>;

  beforeEach(async () => {
    const mockCompanyRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCompanyUseCase,
        {
          provide: COMPANY_REPOSITORY,
          useValue: mockCompanyRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateCompanyUseCase>(CreateCompanyUseCase);
    companyRepository = module.get(COMPANY_REPOSITORY);
  });

  describe('execute', () => {
    const validCompanyData: Omit<Company, 'id'> = {
      cnpj: '12.345.678/0001-90',
      institutionName: 'Hospital São Lucas',
      cnes: '1234567',
      fkUserId: '987e6543-e21b-34d5-a678-426614174111',
    };

    it('should create a new company successfully', async () => {
      const savedCompany: Company = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...validCompanyData,
      };

      companyRepository.save.mockResolvedValue(savedCompany);

      const result = await useCase.execute(validCompanyData);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(savedCompany);
      expect(companyRepository.save).toHaveBeenCalledWith(validCompanyData);
    });

    it('should return failure when repository returns null', async () => {
      companyRepository.save.mockResolvedValue(null as any);

      const result = await useCase.execute(validCompanyData);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.CompanyNotFoundError);
      expect(companyRepository.save).toHaveBeenCalledWith(validCompanyData);
    });

    it('should handle different CNPJ formats', async () => {
      const cnpjFormats = [
        '12.345.678/0001-90',
        '12345678000190',
        '98.765.432/0001-11',
        '98765432000111',
      ];

      for (const cnpj of cnpjFormats) {
        const companyData: Omit<Company, 'id'> = { ...validCompanyData, cnpj };
        const savedCompany: Company = {
          id: `company-${cnpj.replace(/\D/g, '')}`,
          ...companyData,
        };

        companyRepository.save.mockResolvedValue(savedCompany);

        const result = await useCase.execute(companyData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.cnpj).toBe(cnpj);
      }
    });

    it('should handle different types of medical institutions', async () => {
      const institutions = [
        { name: 'Hospital Geral da Cidade', cnes: '1111111' },
        { name: 'Clínica de Especialidades Médicas', cnes: '2222222' },
        { name: 'Banco de Sangue Central', cnes: '3333333' },
        { name: 'Centro de Hematologia e Hemoterapia', cnes: '4444444' },
        { name: 'Fundação Pró-Sangue Hemocentro', cnes: '5555555' },
      ];

      for (const institution of institutions) {
        const companyData: Omit<Company, 'id'> = {
          ...validCompanyData,
          institutionName: institution.name,
          cnes: institution.cnes,
          fkUserId: `user-${institution.cnes}`,
        };

        const savedCompany: Company = {
          id: `company-${institution.cnes}`,
          ...companyData,
        };
        companyRepository.save.mockResolvedValue(savedCompany);

        const result = await useCase.execute(companyData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.institutionName).toBe(institution.name);
        expect(result.value?.cnes).toBe(institution.cnes);
      }
    });

    it('should handle different CNES codes', async () => {
      const cnesCodes = [
        '1234567',
        '7654321',
        '0000001',
        '9999999',
        '1111111',
        '2222222',
      ];

      for (const cnes of cnesCodes) {
        const companyData: Omit<Company, 'id'> = { ...validCompanyData, cnes };
        const savedCompany: Company = { id: `company-${cnes}`, ...companyData };

        companyRepository.save.mockResolvedValue(savedCompany);

        const result = await useCase.execute(companyData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.cnes).toBe(cnes);
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
        const companyData: Omit<Company, 'id'> = {
          ...validCompanyData,
          fkUserId,
        };
        const savedCompany: Company = {
          id: `company-${fkUserId.slice(0, 8)}`,
          ...companyData,
        };

        companyRepository.save.mockResolvedValue(savedCompany);

        const result = await useCase.execute(companyData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.fkUserId).toBe(fkUserId);
      }
    });

    it('should handle hospital companies', async () => {
      const hospitalData: Omit<Company, 'id'> = {
        ...validCompanyData,
        institutionName: 'Hospital das Clínicas - FMUSP',
        cnpj: '11.222.333/0001-44',
        cnes: '1122334',
      };

      const savedHospital: Company = {
        id: 'hospital-company',
        ...hospitalData,
      };
      companyRepository.save.mockResolvedValue(savedHospital);

      const result = await useCase.execute(hospitalData);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.institutionName).toContain('Hospital');
    });

    it('should handle blood bank companies', async () => {
      const bloodBankData: Omit<Company, 'id'> = {
        ...validCompanyData,
        institutionName: 'Banco de Sangue do Estado',
        cnpj: '22.333.444/0001-55',
        cnes: '2233445',
      };

      const savedBloodBank: Company = {
        id: 'bloodbank-company',
        ...bloodBankData,
      };
      companyRepository.save.mockResolvedValue(savedBloodBank);

      const result = await useCase.execute(bloodBankData);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.institutionName).toContain('Banco de Sangue');
    });

    it('should handle clinic companies', async () => {
      const clinicData: Omit<Company, 'id'> = {
        ...validCompanyData,
        institutionName: 'Clínica Médica Especializada',
        cnpj: '33.444.555/0001-66',
        cnes: '3344556',
      };

      const savedClinic: Company = { id: 'clinic-company', ...clinicData };
      companyRepository.save.mockResolvedValue(savedClinic);

      const result = await useCase.execute(clinicData);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.institutionName).toContain('Clínica');
    });

    it('should handle repository errors gracefully', async () => {
      companyRepository.save.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(validCompanyData)).rejects.toThrow(
        'Database connection failed',
      );
      expect(companyRepository.save).toHaveBeenCalledWith(validCompanyData);
    });

    it('should handle edge case CNPJ values', async () => {
      const edgeCaseCnpjs = [
        '00.000.000/0001-91',
        '11.111.111/1111-11',
        '99.999.999/9999-99',
      ];

      for (const cnpj of edgeCaseCnpjs) {
        const companyData: Omit<Company, 'id'> = { ...validCompanyData, cnpj };
        const savedCompany: Company = {
          id: `edge-${cnpj.replace(/\D/g, '')}`,
          ...companyData,
        };

        companyRepository.save.mockResolvedValue(savedCompany);

        const result = await useCase.execute(companyData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.cnpj).toBe(cnpj);
      }
    });

    it('should handle institution names with special characters', async () => {
      const specialNames = [
        'Hospital São José & Cia',
        'Clínica Médica - Unidade I',
        'Centro de Saúde (Filial)',
        'Fundação Pró-Vida',
        "Instituto D'Or",
      ];

      for (const institutionName of specialNames) {
        const companyData: Omit<Company, 'id'> = {
          ...validCompanyData,
          institutionName,
          fkUserId: `user-${institutionName.length}`,
        };

        const savedCompany: Company = {
          id: `special-${institutionName.length}`,
          ...companyData,
        };
        companyRepository.save.mockResolvedValue(savedCompany);

        const result = await useCase.execute(companyData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.institutionName).toBe(institutionName);
      }
    });

    it('should handle long institution names', async () => {
      const longName =
        'Fundação Centro de Hematologia e Hemoterapia de Minas Gerais - Hemominas - Unidade Regional de Juiz de Fora';
      const companyData: Omit<Company, 'id'> = {
        ...validCompanyData,
        institutionName: longName,
      };

      const savedCompany: Company = { id: 'long-name-company', ...companyData };
      companyRepository.save.mockResolvedValue(savedCompany);

      const result = await useCase.execute(companyData);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.institutionName).toBe(longName);
    });

    it('should handle concurrent company creation', async () => {
      const companyDataList = Array(5)
        .fill(null)
        .map((_, index) => ({
          ...validCompanyData,
          cnpj: `12.345.678/000${index}-90`,
          cnes: `123456${index}`,
          fkUserId: `user-${index}`,
        }));

      const savedCompanies = companyDataList.map((data, index) => ({
        id: `company-${index}`,
        ...data,
      }));

      companyRepository.save
        .mockResolvedValueOnce(savedCompanies[0])
        .mockResolvedValueOnce(savedCompanies[1])
        .mockResolvedValueOnce(savedCompanies[2])
        .mockResolvedValueOnce(savedCompanies[3])
        .mockResolvedValueOnce(savedCompanies[4]);

      const promises = companyDataList.map((data) => useCase.execute(data));
      const results = await Promise.all(promises);

      results.forEach((result, index) => {
        expect(result.isSuccess).toBe(true);
        expect(result.value?.cnpj).toBe(companyDataList[index].cnpj);
      });

      expect(companyRepository.save).toHaveBeenCalledTimes(5);
    });

    it('should handle undefined return from repository', async () => {
      companyRepository.save.mockResolvedValue(undefined as any);

      const result = await useCase.execute(validCompanyData);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(ErrorsEnum.CompanyNotFoundError);
    });

    it('should handle CNES edge cases', async () => {
      const edgeCases = ['0000000', '1111111', '9999999'];

      for (const cnes of edgeCases) {
        const companyData: Omit<Company, 'id'> = { ...validCompanyData, cnes };
        const savedCompany: Company = {
          id: `edge-cnes-${cnes}`,
          ...companyData,
        };

        companyRepository.save.mockResolvedValue(savedCompany);

        const result = await useCase.execute(companyData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.cnes).toBe(cnes);
        expect(result.value?.cnes).toHaveLength(7);
      }
    });

    it('should handle different types of healthcare facilities', async () => {
      const facilityTypes = [
        { type: 'Hospital Público', name: 'Hospital Municipal de Emergência' },
        { type: 'Hospital Privado', name: 'Hospital Sírio-Libanês' },
        { type: 'UBS', name: 'Unidade Básica de Saúde Central' },
        { type: 'Laboratório', name: 'Laboratório de Análises Clínicas' },
        { type: 'Hemocentro', name: 'Hemocentro Regional' },
      ];

      for (const facility of facilityTypes) {
        const companyData: Omit<Company, 'id'> = {
          ...validCompanyData,
          institutionName: facility.name,
          cnes: `${facility.type.length}${Math.floor(Math.random() * 1000000)}`.padStart(
            7,
            '0',
          ),
          fkUserId: `user-${facility.type.replace(/\s/g, '-').toLowerCase()}`,
        };

        const savedCompany: Company = {
          id: `${facility.type.toLowerCase()}-company`,
          ...companyData,
        };
        companyRepository.save.mockResolvedValue(savedCompany);

        const result = await useCase.execute(companyData);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.institutionName).toBe(facility.name);
      }
    });
  });
});
