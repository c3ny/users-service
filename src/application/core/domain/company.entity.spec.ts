import { Company } from './company.entity';

describe('Company Entity', () => {
  describe('Company creation', () => {
    it('should create a company with all required properties', () => {
      const companyData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        cnpj: '12.345.678/0001-90',
        institutionName: 'Hospital São Lucas',
        cnes: '1234567',
        fkUserId: '987e6543-e21b-34d5-a678-426614174111',
      };

      const company = new Company();
      Object.assign(company, companyData);

      expect(company.id).toBe(companyData.id);
      expect(company.cnpj).toBe(companyData.cnpj);
      expect(company.institutionName).toBe(companyData.institutionName);
      expect(company.cnes).toBe(companyData.cnes);
      expect(company.fkUserId).toBe(companyData.fkUserId);
    });

    it('should handle CNPJ with different formats', () => {
      const cnpjFormats = [
        '12.345.678/0001-90',
        '12345678000190',
        '12 345 678 0001 90',
      ];

      cnpjFormats.forEach((cnpj) => {
        const company = new Company();
        company.cnpj = cnpj;
        expect(company.cnpj).toBe(cnpj);
      });
    });

    it('should handle different institution names', () => {
      const institutionNames = [
        'Hospital São Lucas',
        'Clínica Médica Central',
        'Centro de Hematologia e Hemoterapia',
        'Fundação Pró-Sangue Hemocentro de São Paulo',
        'Hospital das Clínicas - FMUSP',
      ];

      institutionNames.forEach((name) => {
        const company = new Company();
        company.institutionName = name;
        expect(company.institutionName).toBe(name);
      });
    });

    it('should handle CNES codes', () => {
      const cnesCodes = ['1234567', '7654321', '0000001', '9999999'];

      cnesCodes.forEach((cnes) => {
        const company = new Company();
        company.cnes = cnes;
        expect(company.cnes).toBe(cnes);
      });
    });

    it('should handle foreign key relationships', () => {
      const userIds = [
        '123e4567-e89b-12d3-a456-426614174000',
        '987e6543-e21b-34d5-a678-426614174111',
        '456f7890-f12c-45e6-b789-426614174222',
      ];

      userIds.forEach((userId) => {
        const company = new Company();
        company.fkUserId = userId;
        expect(company.fkUserId).toBe(userId);
      });
    });
  });

  describe('Company validation scenarios', () => {
    it('should create company for blood bank', () => {
      const company = new Company();
      company.institutionName = 'Banco de Sangue Central';
      company.cnpj = '11.222.333/0001-44';
      company.cnes = '1122334';

      expect(company.institutionName).toContain('Banco de Sangue');
      expect(company.cnpj).toMatch(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
      expect(company.cnes).toHaveLength(7);
    });

    it('should create company for hospital', () => {
      const company = new Company();
      company.institutionName = 'Hospital Geral da Cidade';
      company.cnpj = '55.666.777/0001-88';
      company.cnes = '5566778';

      expect(company.institutionName).toContain('Hospital');
      expect(company.cnpj).toMatch(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
      expect(company.cnes).toHaveLength(7);
    });

    it('should create company for clinic', () => {
      const company = new Company();
      company.institutionName = 'Clínica de Especialidades Médicas';
      company.cnpj = '99.888.777/0001-66';
      company.cnes = '9988776';

      expect(company.institutionName).toContain('Clínica');
      expect(company.cnpj).toMatch(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
      expect(company.cnes).toHaveLength(7);
    });
  });

  describe('Company business rules', () => {
    it('should maintain referential integrity with user', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const company = new Company();
      company.fkUserId = userId;

      expect(company.fkUserId).toBe(userId);
      expect(company.fkUserId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should handle institution names with special characters', () => {
      const specialNames = [
        'Hospital São José & Cia',
        'Clínica Médica - Unidade I',
        'Centro de Saúde (Filial)',
        'Fundação Pró-Vida',
      ];

      specialNames.forEach((name) => {
        const company = new Company();
        company.institutionName = name;
        expect(company.institutionName).toBe(name);
      });
    });

    it('should handle edge cases for CNES', () => {
      const edgeCases = ['0000000', '1111111', '9999999'];

      edgeCases.forEach((cnes) => {
        const company = new Company();
        company.cnes = cnes;
        expect(company.cnes).toBe(cnes);
        expect(company.cnes).toHaveLength(7);
      });
    });
  });
});
