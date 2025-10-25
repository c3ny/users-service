import { InjectRepository } from '@nestjs/typeorm';
import { DonorRepositoryPort } from '@/application/ports/out/donor-repository.port';
import { Donors } from './domain/donor.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Donor } from '@/application/core/domain/donor.entity';
import { DonorMapper } from './mappers/donor.mapper';

@Injectable()
export class DonorRepository implements DonorRepositoryPort {
  constructor(
    @InjectRepository(Donors)
    private readonly donorRepository: Repository<Donor>,
  ) {}

  async save(donor: Omit<Donor, 'id'>): Promise<Donor> {
    const donorToSave = DonorMapper.toPersistence(donor);

    const savedDonor = await this.donorRepository.save({
      ...donorToSave,
    });

    return savedDonor;
  }

  async findById(id: string): Promise<Donor | null> {
    return this.donorRepository.findOneBy({ id });
  }

  async update(donor: Donor): Promise<Donor> {
    return this.donorRepository.save(donor);
  }

  async delete(id: string): Promise<void> {
    await this.donorRepository.delete(id);
  }

  async findByUserId(userId: string): Promise<Donor | null> {
    const donor = await this.donorRepository.findOneBy({
      fkUserId: userId,
    });

    if (!donor) {
      return null;
    }

    return DonorMapper.toDomain(donor);
  }
}
