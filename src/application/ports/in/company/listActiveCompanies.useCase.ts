import { CompanyRepositoryPort, PaginatedCompanies } from '../../out/company-repository.port';
import { Result, ResultFactory } from '@/application/types/result.types';
import { Inject, Injectable } from '@nestjs/common';
import { COMPANY_REPOSITORY } from '@/constants';

export interface ListActiveCompaniesInput {
  city?: string;
  uf?: string;
  page: number;
  limit: number;
}

@Injectable()
export class ListActiveCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepositoryPort,
  ) {}

  async execute(input: ListActiveCompaniesInput): Promise<Result<PaginatedCompanies>> {
    const page = Math.max(1, input.page);
    const limit = Math.min(50, Math.max(1, input.limit));

    const result = await this.companyRepository.findAllActive({
      city: input.city,
      uf: input.uf,
      page,
      limit,
    });

    return ResultFactory.success(result);
  }
}
