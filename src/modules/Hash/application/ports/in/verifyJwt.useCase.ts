import { Inject } from '@nestjs/common';
import { UseCase } from 'src/application/types/useCase.types';
import { JwtRepositoryPort, JwtToken } from '../out/jwt-repository.port';
import { JWT_REPOSITORY } from 'src/modules/Hash/constants';

export class VerifyJwtUseCase implements UseCase<string, JwtToken> {
  constructor(
    @Inject(JWT_REPOSITORY)
    private readonly jwtRepository: JwtRepositoryPort,
  ) {}

  execute(token: string): JwtToken {
    return this.jwtRepository.verify(token);
  }
}
