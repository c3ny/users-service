export type JwtPayload = string | object;

export type JwtToken = string | object | null;

export interface JwtRepositoryPort {
  generate(payload: JwtPayload): string;
  verify(token: string): JwtToken;
}
