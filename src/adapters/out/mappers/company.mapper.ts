import { Company } from 'src/application/core/domain/company.entity';
import { Companies } from '../domain/company.entity';

export type CompanyPersistence = Omit<Company, 'id' | 'fkUserId'> & {
  user: { id: string };
};

export class CompanyMapper {
  static toDomain(company: Companies): Company {
    return {
      id: company.id,
      cnpj: company.cnpj,
      institutionName: company.institutionName,
      cnes: company.cnes,
      fkUserId: company.user.id,
    };
  }

  static toPersistence(company: Omit<Company, 'id'>): CompanyPersistence {
    return {
      cnpj: company.cnpj,
      institutionName: company.institutionName,
      cnes: company.cnes,
      user: {
        id: company.fkUserId,
      },
    };
  }
}
