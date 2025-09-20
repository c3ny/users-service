export type Hash = `${string}:${string}`;

export interface HashRepositoryPort {
  hash(password: string): `${string}:${string}`;
  compare(password: string, hash: string): boolean;
}
