import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@/application/types/useCase.types';
import { HashRepositoryPort } from '../out/hash-repository.port';
import { HASH_REPOSITORY } from '@/modules/Hash/constants';

@Injectable()
export class HashStringUseCase implements UseCase<string, string> {
  constructor(
    @Inject(HASH_REPOSITORY)
    private readonly hashRepository: HashRepositoryPort,
  ) {}

  execute(password: string): string {
    return this.hashRepository.hash(password);
  }
}
