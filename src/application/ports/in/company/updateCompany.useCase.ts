import { CompanyRepositoryPort } from '../../out/company-repository.port';
import { Company } from '@/application/core/domain/company.entity';
import { Result, ResultFactory } from '@/application/types/result.types';
import { Inject, Injectable } from '@nestjs/common';
import { COMPANY_REPOSITORY } from '@/constants';
import { ErrorsEnum } from '@/application/core/errors/errors.enum';

export type UpdateCompanyInput = Partial<
  Omit<Company, 'id' | 'cnpj' | 'cnes' | 'fkUserId' | 'slug' | 'institutionName'>
>;

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepositoryPort,
  ) {}

  async execute(
    companyId: string,
    ownerUserId: string,
    patch: UpdateCompanyInput,
  ): Promise<Result<Company>> {
    const existing = await this.companyRepository.findById(companyId);

    if (!existing) {
      return ResultFactory.failure(ErrorsEnum.CompanyNotFoundError);
    }

    if (existing.fkUserId !== ownerUserId) {
      return ResultFactory.failure(ErrorsEnum.CompanyUnauthorizedError);
    }

    const updated: Company = { ...existing, ...patch };

    const saved = await this.companyRepository.update(updated);

    return ResultFactory.success(saved);
  }
}
