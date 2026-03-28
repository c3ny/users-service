export type JwtPayload = {
  id: string;
  email: string;
  personType: string;
  companyId?: string | null;
  isProfileComplete: boolean;
};

export type JwtToken = string | object | null;

export interface JwtRepositoryPort {
  generate(payload: JwtPayload, expiresIn?: string): string;
  verify(token: string): JwtToken;
}
