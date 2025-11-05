import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../../application/core/domain/company.entity';
import { CompanyRepositoryPort } from './company-repository.port';

@Injectable()
export class CompanyRepository implements CompanyRepositoryPort {
  constructor(
    @InjectRepository(Company)
    private readonly repository: Repository<Company>,
  ) {}

  async save(company: Company): Promise<Company> {
    return await this.repository.save(company);
  }

  async findById(id: string): Promise<Company | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<Company[]> {
    return await this.repository.find();
  }

  async update(company: Company): Promise<Company> {

    return await this.repository.save(company);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByUserId(userId: string): Promise<Company | null> {
    return await this.repository.findOne({
      where: { fkUserId: userId },
    });
  }
}
