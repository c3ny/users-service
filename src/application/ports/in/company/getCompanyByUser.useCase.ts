import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepository } from '../../../../adapters/out/company.repository';



@Injectable()
export class GetCompanyByUserUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(userId: string) {
    const company = await this.companyRepository.findByUserId(userId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }
}
