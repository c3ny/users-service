import { UseCase } from 'src/application/types/useCase.types';
import { JwtPayload, JwtRepositoryPort } from '../out/jwt-repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { JWT_REPOSITORY } from 'src/modules/Hash/constants';

@Injectable()
export class GenerateJwtUseCase implements UseCase<JwtPayload, string> {
  constructor(
    @Inject(JWT_REPOSITORY)
    private readonly jwtRepository: JwtRepositoryPort,
  ) {}

  execute(payload: JwtPayload): string {
    return this.jwtRepository.generate(payload);
  }
}
