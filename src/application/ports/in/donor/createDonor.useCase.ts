import { UseCase } from 'src/application/types/useCase.types';
import { DonorRepositoryPort } from '../../out/donor-repository.port';
import { Donor } from 'src/application/core/domain/donor.entity';
import { Result, ResultFactory } from 'src/application/types/result.types';
import { Inject } from '@nestjs/common';
import { DONOR_REPOSITORY } from 'src/constants';

export class CreateDonorUseCase
  implements UseCase<Donor, Promise<Result<Donor>>>
{
  constructor(
    @Inject(DONOR_REPOSITORY)
    private readonly donorRepository: DonorRepositoryPort,
  ) {}

  async execute(donor: Omit<Donor, 'id'>): Promise<Result<Donor>> {
    const savedDonor = await this.donorRepository.save(donor);

    return ResultFactory.success(savedDonor);
  }
}
