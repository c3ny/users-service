import { CompanyRepositoryPort } from '../../out/company-repository.port';
import { Company } from '@/application/core/domain/company.entity';
import { Result, ResultFactory } from '@/application/types/result.types';
import { Inject, Injectable } from '@nestjs/common';
import { COMPANY_REPOSITORY } from '@/constants';
import { ErrorsEnum } from '@/application/core/errors/errors.enum';

export type CompanyImageType = 'banner' | 'logo';

@Injectable()
export class UpdateCompanyImageUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepositoryPort,
  ) {}

  async execute(
    companyId: string,
    ownerUserId: string,
    imageType: CompanyImageType,
    imageUrl: string,
  ): Promise<Result<Company>> {
    const existing = await this.companyRepository.findById(companyId);

    if (!existing) {
      return ResultFactory.failure(ErrorsEnum.CompanyNotFoundError);
    }

    if (existing.fkUserId !== ownerUserId) {
      return ResultFactory.failure(ErrorsEnum.CompanyUnauthorizedError);
    }

    const patch =
      imageType === 'banner'
        ? { bannerImage: imageUrl }
        : { logoImage: imageUrl };

    const saved = await this.companyRepository.update({
      ...existing,
      ...patch,
    });

    return ResultFactory.success(saved);
  }
}
