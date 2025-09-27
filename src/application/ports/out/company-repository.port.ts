import { Company } from 'src/application/core/domain/company.entity';

export interface CompanyRepositoryPort {
  save(company: Omit<Company, 'id'>): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  update(company: Company): Promise<Company>;
  delete(id: string): Promise<void>;
}
