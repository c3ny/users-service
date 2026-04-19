import { Gender } from '@/application/types/user.types';

export class Donor {
  id: string;
  cpf: string;
  bloodType: string;
  birthDate: Date;
  fkUserId: string;
  gender?: Gender | null;
  lastDonationDate?: Date | null;
}
