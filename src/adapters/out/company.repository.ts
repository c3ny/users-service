import {
  CompanyRepositoryPort,
  ListActiveCompaniesFilters,
  PaginatedCompanies,
} from '@/application/ports/out/company-repository.port';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Companies } from './domain/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '@/application/core/domain/company.entity';
import { CompanyMapper } from './mappers/company.mapper';

export class CompanyRepository implements CompanyRepositoryPort {
  constructor(
    @InjectRepository(Companies)
    private readonly companyRepository: Repository<Companies>,
  ) {}

  async save(company: Omit<Company, 'id'>): Promise<Company> {
    const companyToSave = CompanyMapper.toPersistence(company);
    const savedCompany = await this.companyRepository.save(companyToSave);
    return CompanyMapper.toDomain(savedCompany);
  }

  async findByUserId(userId: string): Promise<Company | null> {
    const company = await this.companyRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!company) return null;

    return CompanyMapper.toDomain(company);
  }

  async findById(id: string): Promise<Company | null> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!company) return null;

    return CompanyMapper.toDomain(company);
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const company = await this.companyRepository.findOne({
      where: { slug },
      relations: ['user'],
    });

    if (!company) return null;

    return CompanyMapper.toDomain(company);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return this.companyRepository.existsBy({ slug });
  }

  async findAllActive(filters: ListActiveCompaniesFilters): Promise<PaginatedCompanies> {
    const where: FindOptionsWhere<Companies> = { status: 'ACTIVE' };

    if (filters.city) {
      where.city = filters.city;
    }
    if (filters.uf) {
      where.uf = filters.uf;
    }

    const [entities, total] = await this.companyRepository.findAndCount({
      where,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      order: { institutionName: 'ASC' },
    });

    return {
      companies: entities.map(CompanyMapper.toPublicListItem),
      total,
    };
  }

  async update(company: Company): Promise<Company> {
    const companyToUpdate = CompanyMapper.toPersistenceWithId(company);
    const updatedCompany = await this.companyRepository.save(companyToUpdate);
    return CompanyMapper.toDomain(updatedCompany);
  }

  async delete(id: string): Promise<void> {
    const companyToDelete = await this.companyRepository.findOneBy({ id });

    if (!companyToDelete) {
      throw new Error('Company not found');
    }

    await this.companyRepository.delete(companyToDelete.id);
  }
}
