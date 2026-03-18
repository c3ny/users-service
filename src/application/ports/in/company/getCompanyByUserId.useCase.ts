import { Inject, Injectable } from '@nestjs/common';
import { COMPANY_REPOSITORY } from '@/constants';
import { Company } from '@/application/core/domain/company.entity';
import { CompanyRepositoryPort } from '../../out/company-repository.port';
import { Result, ResultFactory } from '@/application/types/result.types';
import { ErrorsEnum } from '@/application/core/errors/errors.enum';

@Injectable()
export class GetCompanyByUserIdUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepositoryPort,
  ) {}

  async execute(userId: string): Promise<Result<Company>> {
    const company = await this.companyRepository.findByUserId(userId);

    if (!company) {
      return ResultFactory.failure(ErrorsEnum.CompanyNotFoundError); 
    }

    return ResultFactory.success(company);
  }
}