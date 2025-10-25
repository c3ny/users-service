import { CompanyRepositoryPort } from '@/application/ports/out/company-repository.port';
import { Repository } from 'typeorm';
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

  async findById(id: string): Promise<Company | null> {
    const company = await this.companyRepository.findOneBy({ id });

    if (!company) {
      return null;
    }

    return CompanyMapper.toDomain(company);
  }

  async update(company: Company): Promise<Company> {
    const companyToUpdate = CompanyMapper.toPersistence(company);

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
