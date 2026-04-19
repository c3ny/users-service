import { Donor } from '@/application/core/domain/donor.entity';
import { Gender } from '@/application/types/user.types';

export type DonorPersistence = Omit<Donor, 'id' | 'fkUserId'> & {
  user: { id: string };
};

const asGender = (value?: string | null): Gender | null => {
  if (value === Gender.MALE || value === Gender.FEMALE) return value;
  return null;
};

export class DonorMapper {
  static toDomain(donor: Omit<Donor, 'user'>): Donor {
    return {
      id: donor.id,
      cpf: donor.cpf,
      bloodType: donor.bloodType ?? '',
      birthDate: donor.birthDate ?? new Date(),
      fkUserId: donor.fkUserId,
      gender: asGender(donor.gender as string | null | undefined),
      lastDonationDate: donor.lastDonationDate ?? null,
    };
  }

  static toPersistence(donor: Omit<Donor, 'id'>): DonorPersistence {
    return {
      cpf: donor.cpf,
      bloodType: donor.bloodType,
      birthDate: donor.birthDate,
      gender: donor.gender ?? null,
      lastDonationDate: donor.lastDonationDate ?? null,
      user: {
        id: donor.fkUserId,
      },
    };
  }
}
