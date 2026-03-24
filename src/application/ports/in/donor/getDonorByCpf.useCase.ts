import { DonorRepositoryPort } from '../../out/donor-repository.port';
import { Donor } from '@/application/core/domain/donor.entity';
import { Inject } from '@nestjs/common';
import { DONOR_REPOSITORY } from '@/constants';

export class GetDonorByCpfUseCase {
  constructor(
    @Inject(DONOR_REPOSITORY)
    private readonly donorRepository: DonorRepositoryPort,
  ) {}

  async execute(cpf: string): Promise<Donor | null> {
    return this.donorRepository.findByCpf(cpf);
  }
}
