export interface CompanySchedule {
  dayOfWeek:
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export type CompanyType = 'HOSPITAL' | 'BLOOD_CENTER' | 'CLINIC';
export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export class Company {
  id: string;
  cnpj: string;
  institutionName: string;
  cnes: string;
  fkUserId: string;
  slug: string;
  type?: CompanyType;
  status?: CompanyStatus;
  description?: string;
  bannerImage?: string;
  logoImage?: string;
  phone?: string;
  whatsapp?: string;
  contactEmail?: string;
  website?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  uf?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  schedule?: CompanySchedule[];
  acceptsDonations?: boolean;
  acceptsScheduling?: boolean;
}
