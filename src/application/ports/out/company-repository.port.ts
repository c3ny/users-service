import { Company } from '@/application/core/domain/company.entity';

export interface ListActiveCompaniesFilters {
  city?: string;
  uf?: string;
  page: number;
  limit: number;
}

export interface PaginatedCompanies {
  companies: Company[];
  total: number;
}

export interface CompanyRepositoryPort {
  save(company: Omit<Company, 'id'>): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  findByUserId(userId: string): Promise<Company | null>;
  findBySlug(slug: string): Promise<Company | null>;
  existsBySlug(slug: string): Promise<boolean>;
  findAllActive(filters: ListActiveCompaniesFilters): Promise<PaginatedCompanies>;
  update(company: Company): Promise<Company>;
  delete(id: string): Promise<void>;
}
