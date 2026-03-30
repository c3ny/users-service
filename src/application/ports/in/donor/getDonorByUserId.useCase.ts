import { Inject, Injectable } from '@nestjs/common';
import { Donor } from '@/application/core/domain/donor.entity';
import { DonorRepositoryPort } from '../../out/donor-repository.port';
import { DONOR_REPOSITORY } from '@/constants';

@Injectable()
export class GetDonorByUserIdUseCase {
  constructor(
    @Inject(DONOR_REPOSITORY)
    private readonly donorRepository: DonorRepositoryPort,
  ) {}

  async execute(userId: string): Promise<Donor | null> {
    return this.donorRepository.findByUserId(userId);
  }
}
