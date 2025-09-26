import { Donor } from 'src/application/core/domain/donor.entity';

export type DonorPersistence = Omit<Donor, 'id' | 'fkUserId'> & {
  user: { id: string };
};

export class DonorMapper {
  static toDomain(donor: Omit<Donor, 'user'>): Donor {
    return {
      id: donor.id,
      cpf: donor.cpf,
      bloodType: donor.bloodType ?? '',
      birthDate: donor.birthDate ?? new Date(),
      fkUserId: donor.fkUserId,
    };
  }

  static toPersistence(donor: Omit<Donor, 'id'>): DonorPersistence {
    return {
      cpf: donor.cpf,
      bloodType: donor.bloodType,
      birthDate: donor.birthDate,
      user: {
        id: donor.fkUserId,
      },
    };
  }
}
