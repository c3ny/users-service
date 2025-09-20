export interface HashRepositoryPort {
  hash(password: string): string;
  compare(password: string, hash: string): boolean;
}
