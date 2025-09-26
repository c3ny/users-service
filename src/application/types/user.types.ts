export enum PersonType {
  DONOR = 'DONOR',
  COMPANY = 'COMPANY',
}

export interface BaseCreateUserRequest {
  email: string;
  password?: string;
  name: string;
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
}

export interface CreateCompanyRequest extends BaseCreateUserRequest {
  personType: PersonType.COMPANY;
  cnpj: string;
  institutionName: string;
  cnes: string;
}

export type CreateUserRequest = CreateDonorRequest | CreateCompanyRequest;
