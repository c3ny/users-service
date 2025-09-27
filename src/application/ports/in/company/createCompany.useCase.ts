import { CompanyRepositoryPort } from '../../out/company-repository.port';
import { UseCase } from 'src/application/types/useCase.types';
import { Company } from 'src/application/core/domain/company.entity';
import { Result, ResultFactory } from 'src/application/types/result.types';
import { Inject } from '@nestjs/common';
import { COMPANY_REPOSITORY } from 'src/constants';
import { ErrorsEnum } from 'src/application/core/errors/errors.enum';

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
