import { CompanyRepositoryPort } from '../../out/company-repository.port';
import { Company } from '@/application/core/domain/company.entity';
import { Result, ResultFactory } from '@/application/types/result.types';
import { Inject, Injectable } from '@nestjs/common';
import { COMPANY_REPOSITORY } from '@/constants';
import { ErrorsEnum } from '@/application/core/errors/errors.enum';

@Injectable()
export class GetCompanyBySlugUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepositoryPort,
  ) {}

  async execute(slug: string): Promise<Result<Company>> {
    const company = await this.companyRepository.findBySlug(slug);

    if (!company) {
      return ResultFactory.failure(ErrorsEnum.CompanyNotFoundError);
    }

    if (company.status && company.status !== 'ACTIVE') {
      return ResultFactory.failure(ErrorsEnum.CompanyNotFoundError);
    }

    return ResultFactory.success(company);
  }
}
