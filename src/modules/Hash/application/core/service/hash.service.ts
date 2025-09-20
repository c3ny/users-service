import { Injectable } from '@nestjs/common';
import { CompareHashUseCase } from '../../ports/in/compareHash.useCase';
import { HashStringUseCase } from '../../ports/in/hashString.useCase';

@Injectable()
export class HashService {
  constructor(
    private readonly hashStringUseCase: HashStringUseCase,
    private readonly compareHashUseCase: CompareHashUseCase,
  ) {}
  hash(password: string): string {
    return this.hashStringUseCase.execute(password);
  }

  compare(compare: string, passwordWithHash: `${string}:${string}`): boolean {
    return this.compareHashUseCase.execute({
      password: compare,
      hash: passwordWithHash,
    });
  }
}
