import { Inject, Injectable } from '@nestjs/common';
import { CompanyRepositoryPort } from '../../out/company-repository.port';
import { CompanyRepository } from '../../../../adapters/out/company.repository';
import { Result } from '../../../types/result.types';
import { ErrorsEnum } from '../../../core/errors/errors.enum';
import { Company } from '../../../core/domain/company.entity';

@Injectable()
export class GetCompanyByUserUseCase {
  constructor(
    @Inject(CompanyRepository)
    private readonly companyRepository: CompanyRepositoryPort,
  ) {}

  async execute(userId: string): Promise<Result<Company>> {
    try {
      const company = await this.companyRepository.findByUserId(userId);

      if (!company) {
        return { isSuccess: false, error: ErrorsEnum.CompanyNotFoundError } as unknown as Result<Company>;
      }

      return { isSuccess: true, value: company } as unknown as Result<Company>;
    } catch (error) {
      
      throw error;
    }
  }
}
