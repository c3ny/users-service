export enum PersonType {
  DONOR = 'DONOR',
  COMPANY = 'COMPANY',
}

/**
 * Sexo biologico do doador. Define o intervalo minimo entre doacoes
 * conforme regra Anvisa: MALE 60 dias, FEMALE 90 dias.
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface BaseCreateUserRequest {
  email: string;
  password?: string;
  name: string;
  phone: string;
  city: string;
  uf: string;
  zipcode?: string;
  personType: PersonType;
}

export interface CreateDonorRequest extends BaseCreateUserRequest {
  personType: PersonType.DONOR;
  cpf: string;
  bloodType: string;
  birthDate: Date;
  gender: Gender;
  lastDonationDate?: Date | null;
}

export interface CreateCompanyRequest extends BaseCreateUserRequest {
  personType: PersonType.COMPANY;
  cnpj: string;
  institutionName: string;
  cnes: string;
}

export type CreateUserRequest = CreateDonorRequest | CreateCompanyRequest;
