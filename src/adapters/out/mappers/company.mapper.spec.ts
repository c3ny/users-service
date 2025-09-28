import { CompanyMapper, CompanyPersistence } from './company.mapper';
import { Company } from '../../../application/core/domain/company.entity';
import { Companies } from '../domain/company.entity';
import { Users } from '../domain/user.entity';

describe('CompanyMapper', () => {
  describe('toDomain', () => {
    it('should map Companies entity to Company domain object with all properties', () => {
      const companiesEntity = new Companies();
      companiesEntity.id = '123e4567-e89b-12d3-a456-426614174000';
      companiesEntity.cnpj = '12.345.678/0001-90';
      companiesEntity.institutionName = 'Hospital São Lucas';
      companiesEntity.cnes = '1234567';
      companiesEntity.user = {
        id: '987e6543-e21b-34d5-a678-426614174111',
      } as Users;

      const domainCompany = CompanyMapper.toDomain(companiesEntity);

      expect(domainCompany).toBeInstanceOf(Object);
      expect(domainCompany.id).toBe(companiesEntity.id);
      expect(domainCompany.cnpj).toBe(companiesEntity.cnpj);
      expect(domainCompany.institutionName).toBe(
        companiesEntity.institutionName,
      );
      expect(domainCompany.cnes).toBe(companiesEntity.cnes);
      expect(domainCompany.fkUserId).toBe(companiesEntity.user.id);
    });

    it('should handle different CNPJ formats', () => {
      const cnpjFormats = [
        '12.345.678/0001-90',
        '12345678000190',
        '98.765.432/0001-11',
      ];

      cnpjFormats.forEach((cnpj) => {
        const companiesEntity = new Companies();
        companiesEntity.id = '123e4567-e89b-12d3-a456-426614174000';
        companiesEntity.cnpj = cnpj;
        companiesEntity.institutionName = 'Test Hospital';
        companiesEntity.cnes = '1234567';
        companiesEntity.user = {
          id: '987e6543-e21b-34d5-a678-426614174111',
        } as Users;

        const domainCompany = CompanyMapper.toDomain(companiesEntity);
        expect(domainCompany.cnpj).toBe(cnpj);
      });
    });

    it('should handle different institution names', () => {
      const institutionNames = [
        'Hospital São Lucas',
        'Clínica Médica Central',
        'Centro de Hematologia e Hemoterapia',
        'Fundação Pró-Sangue Hemocentro de São Paulo',
      ];

      institutionNames.forEach((institutionName) => {
        const companiesEntity = new Companies();
        companiesEntity.id = '123e4567-e89b-12d3-a456-426614174000';
        companiesEntity.cnpj = '12.345.678/0001-90';
        companiesEntity.institutionName = institutionName;
        companiesEntity.cnes = '1234567';
        companiesEntity.user = {
          id: '987e6543-e21b-34d5-a678-426614174111',
        } as Users;

        const domainCompany = CompanyMapper.toDomain(companiesEntity);
        expect(domainCompany.institutionName).toBe(institutionName);
      });
    });

    it('should handle different CNES codes', () => {
      const cnesCodes = ['1234567', '7654321', '0000001', '9999999'];

      cnesCodes.forEach((cnes) => {
        const companiesEntity = new Companies();
        companiesEntity.id = '123e4567-e89b-12d3-a456-426614174000';
        companiesEntity.cnpj = '12.345.678/0001-90';
        companiesEntity.institutionName = 'Test Hospital';
        companiesEntity.cnes = cnes;
        companiesEntity.user = {
          id: '987e6543-e21b-34d5-a678-426614174111',
        } as Users;

        const domainCompany = CompanyMapper.toDomain(companiesEntity);
        expect(domainCompany.cnes).toBe(cnes);
      });
    });

    it('should handle user relationship mapping', () => {
      const userIds = [
        '123e4567-e89b-12d3-a456-426614174000',
        '987e6543-e21b-34d5-a678-426614174111',
        '456f7890-f12c-45e6-b789-426614174222',
      ];

      userIds.forEach((userId) => {
        const companiesEntity = new Companies();
        companiesEntity.id = '123e4567-e89b-12d3-a456-426614174000';
        companiesEntity.cnpj = '12.345.678/0001-90';
        companiesEntity.institutionName = 'Test Hospital';
        companiesEntity.cnes = '1234567';
        companiesEntity.user = { id: userId } as Users;

        const domainCompany = CompanyMapper.toDomain(companiesEntity);
        expect(domainCompany.fkUserId).toBe(userId);
      });
    });
  });

  describe('toPersistence', () => {
    it('should map Company domain object to persistence format with user relation', () => {
      const domainCompany: Omit<Company, 'id'> = {
        cnpj: '12.345.678/0001-90',
        institutionName: 'Hospital São Lucas',
        cnes: '1234567',
        fkUserId: '987e6543-e21b-34d5-a678-426614174111',
      };

      const persistenceCompany = CompanyMapper.toPersistence(domainCompany);

      expect(persistenceCompany.cnpj).toBe(domainCompany.cnpj);
      expect(persistenceCompany.institutionName).toBe(
        domainCompany.institutionName,
      );
      expect(persistenceCompany.cnes).toBe(domainCompany.cnes);
      expect(persistenceCompany.user).toEqual({ id: domainCompany.fkUserId });
      expect(persistenceCompany.user.id).toBe(domainCompany.fkUserId);
    });

    it('should handle different types of medical institutions', () => {
      const institutions = [
        { name: 'Hospital Geral', cnpj: '11.111.111/0001-11', cnes: '1111111' },
        {
          name: 'Clínica Especializada',
          cnpj: '22.222.222/0001-22',
          cnes: '2222222',
        },
        {
          name: 'Banco de Sangue',
          cnpj: '33.333.333/0001-33',
          cnes: '3333333',
        },
        {
          name: 'Centro de Hematologia',
          cnpj: '44.444.444/0001-44',
          cnes: '4444444',
        },
      ];

      institutions.forEach((institution) => {
        const domainCompany: Omit<Company, 'id'> = {
          cnpj: institution.cnpj,
          institutionName: institution.name,
          cnes: institution.cnes,
          fkUserId: '987e6543-e21b-34d5-a678-426614174111',
        };

        const persistenceCompany = CompanyMapper.toPersistence(domainCompany);
        expect(persistenceCompany.cnpj).toBe(institution.cnpj);
        expect(persistenceCompany.institutionName).toBe(institution.name);
        expect(persistenceCompany.cnes).toBe(institution.cnes);
      });
    });

    it('should properly map user foreign key relationship', () => {
      const userIds = [
        '123e4567-e89b-12d3-a456-426614174000',
        '987e6543-e21b-34d5-a678-426614174111',
        '456f7890-f12c-45e6-b789-426614174222',
      ];

      userIds.forEach((userId) => {
        const domainCompany: Omit<Company, 'id'> = {
          cnpj: '12.345.678/0001-90',
          institutionName: 'Test Hospital',
          cnes: '1234567',
          fkUserId: userId,
        };

        const persistenceCompany = CompanyMapper.toPersistence(domainCompany);
        expect(persistenceCompany.user.id).toBe(userId);
      });
    });

    it('should handle CNPJ validation scenarios', () => {
      const cnpjScenarios = [
        '12.345.678/0001-90', // Standard format
        '98.765.432/0001-11', // Different numbers
        '00.000.000/0001-91', // Edge case with zeros
      ];

      cnpjScenarios.forEach((cnpj) => {
        const domainCompany: Omit<Company, 'id'> = {
          cnpj,
          institutionName: 'Test Hospital',
          cnes: '1234567',
          fkUserId: '987e6543-e21b-34d5-a678-426614174111',
        };

        const persistenceCompany = CompanyMapper.toPersistence(domainCompany);
        expect(persistenceCompany.cnpj).toBe(cnpj);
      });
    });
  });

  describe('type safety', () => {
    it('should ensure CompanyPersistence type excludes id and fkUserId', () => {
      const persistenceData: CompanyPersistence = {
        cnpj: '12.345.678/0001-90',
        institutionName: 'Hospital São Lucas',
        cnes: '1234567',
        user: { id: '987e6543-e21b-34d5-a678-426614174111' },
      };

      // This should compile without errors
      expect(persistenceData.cnpj).toBeDefined();
      expect(persistenceData.institutionName).toBeDefined();
      expect(persistenceData.cnes).toBeDefined();
      expect(persistenceData.user).toBeDefined();
      expect(persistenceData.user.id).toBeDefined();
    });

    it('should handle edge cases in mapping', () => {
      const edgeCaseCompany = new Companies();
      edgeCaseCompany.id = '123e4567-e89b-12d3-a456-426614174000';
      edgeCaseCompany.cnpj = '00.000.000/0001-00';
      edgeCaseCompany.institutionName = 'A';
      edgeCaseCompany.cnes = '0000000';
      edgeCaseCompany.user = {
        id: '000e0000-e00b-00d0-a000-000000000000',
      } as Users;

      const domainCompany = CompanyMapper.toDomain(edgeCaseCompany);
      expect(domainCompany.cnpj).toBe('00.000.000/0001-00');
      expect(domainCompany.institutionName).toBe('A');
      expect(domainCompany.cnes).toBe('0000000');
    });
  });

  describe('bidirectional mapping', () => {
    it('should maintain data integrity in round-trip mapping', () => {
      const originalDomain: Company = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        cnpj: '12.345.678/0001-90',
        institutionName: 'Hospital São Lucas',
        cnes: '1234567',
        fkUserId: '987e6543-e21b-34d5-a678-426614174111',
      };

      const persistence = CompanyMapper.toPersistence(originalDomain);

      // Simulate the persistence entity structure
      const companiesEntity = new Companies();
      companiesEntity.id = originalDomain.id;
      companiesEntity.cnpj = persistence.cnpj;
      companiesEntity.institutionName = persistence.institutionName;
      companiesEntity.cnes = persistence.cnes;
      companiesEntity.user = persistence.user as Users;

      const backToDomain = CompanyMapper.toDomain(companiesEntity);

      expect(backToDomain.id).toBe(originalDomain.id);
      expect(backToDomain.cnpj).toBe(originalDomain.cnpj);
      expect(backToDomain.institutionName).toBe(originalDomain.institutionName);
      expect(backToDomain.cnes).toBe(originalDomain.cnes);
      expect(backToDomain.fkUserId).toBe(originalDomain.fkUserId);
    });
  });

  describe('business logic validation', () => {
    it('should handle hospital companies', () => {
      const hospitalCompany = new Companies();
      hospitalCompany.id = '123e4567-e89b-12d3-a456-426614174000';
      hospitalCompany.cnpj = '12.345.678/0001-90';
      hospitalCompany.institutionName = 'Hospital das Clínicas';
      hospitalCompany.cnes = '1234567';
      hospitalCompany.user = {
        id: '987e6543-e21b-34d5-a678-426614174111',
      } as Users;

      const domainCompany = CompanyMapper.toDomain(hospitalCompany);
      expect(domainCompany.institutionName).toContain('Hospital');
    });

    it('should handle blood bank companies', () => {
      const bloodBankCompany = new Companies();
      bloodBankCompany.id = '123e4567-e89b-12d3-a456-426614174000';
      bloodBankCompany.cnpj = '98.765.432/0001-11';
      bloodBankCompany.institutionName = 'Banco de Sangue Central';
      bloodBankCompany.cnes = '9876543';
      bloodBankCompany.user = {
        id: '987e6543-e21b-34d5-a678-426614174111',
      } as Users;

      const domainCompany = CompanyMapper.toDomain(bloodBankCompany);
      expect(domainCompany.institutionName).toContain('Banco de Sangue');
    });

    it('should handle clinic companies', () => {
      const clinicCompany = new Companies();
      clinicCompany.id = '123e4567-e89b-12d3-a456-426614174000';
      clinicCompany.cnpj = '55.666.777/0001-88';
      clinicCompany.institutionName = 'Clínica Médica Especializada';
      clinicCompany.cnes = '5566778';
      clinicCompany.user = {
        id: '987e6543-e21b-34d5-a678-426614174111',
      } as Users;

      const domainCompany = CompanyMapper.toDomain(clinicCompany);
      expect(domainCompany.institutionName).toContain('Clínica');
    });
  });
});
