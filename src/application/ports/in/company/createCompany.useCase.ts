import { CompanyRepositoryPort } from '../../out/company-repository.port';
import { UseCase } from '@/application/types/useCase.types';
import { Company } from '@/application/core/domain/company.entity';
import { Result, ResultFactory } from '@/application/types/result.types';
import { Inject, Injectable } from '@nestjs/common';
import { COMPANY_REPOSITORY } from '@/constants';
import { ErrorsEnum } from '@/application/core/errors/errors.enum';

@Injectable()
export class CreateCompanyUseCase
  implements UseCase<Company, Promise<Result<Company>>>
{
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepositoryPort,
  ) {}

  async execute(company: Omit<Company, 'id'>): Promise<Result<Company>> {
    const savedCompany = await this.companyRepository.save(company);

    if (!savedCompany) {
      return ResultFactory.failure(ErrorsEnum.CompanyNotFoundError);
    }

    return ResultFactory.success(savedCompany);
  }
}
