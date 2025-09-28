import { UseCase } from 'src/application/types/useCase.types';
import { HashRepositoryPort } from '../out/hash-repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { HASH_REPOSITORY } from '@/modules/Hash/constants';

export type CompareHashUseCaseParams = {
  password: string;
  hash: string;
};

@Injectable()
export class CompareHashUseCase
  implements UseCase<CompareHashUseCaseParams, boolean>
{
  constructor(
    @Inject(HASH_REPOSITORY)
    private readonly hashRepository: HashRepositoryPort,
  ) {}

  execute({ password, hash }: CompareHashUseCaseParams): boolean {
    return this.hashRepository.compare(password, hash);
  }
}
