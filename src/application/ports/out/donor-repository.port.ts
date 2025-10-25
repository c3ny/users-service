import { Donor } from '@/application/core/domain/donor.entity';

export interface DonorRepositoryPort {
  save(donor: Omit<Donor, 'id'>): Promise<Donor>;
  findById(id: string): Promise<Donor | null>;
  update(donor: Donor): Promise<Donor>;
  delete(id: string): Promise<void>;
}
