import {
  CompanySchedule,
  CompanyStatus,
  CompanyType,
} from '@/application/core/domain/company.entity';

export class CompanyScheduleDto {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export class CompanyPublicResponseDto {
  id: string;
  slug: string;
  institutionName: string;
  cnpj: string;
  cnes: string;
  type: CompanyType | undefined;
  status: CompanyStatus | undefined;
  description: string | undefined;
  bannerImage: string | undefined;
  logoImage: string | undefined;
  phone: string | undefined;
  whatsapp: string | undefined;
  contactEmail: string | undefined;
  website: string | undefined;
  address: string | undefined;
  neighborhood: string | undefined;
  city: string | undefined;
  uf: string | undefined;
  zipcode: string | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
  schedule: CompanySchedule[] | undefined;
  acceptsDonations: boolean;
  acceptsScheduling: boolean;
}
