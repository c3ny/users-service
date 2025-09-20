import { Injectable } from '@nestjs/common';
import { JwtPayload, JwtToken } from '../../ports/out/jwt-repository.port';
import { GenerateJwtUseCase } from '../../ports/in/generateJwt.useCase';
import { VerifyJwtUseCase } from '../../ports/in/verifyJwt.useCase';

@Injectable()
export class JwtService {
  constructor(
    private readonly generateJwtUseCase: GenerateJwtUseCase,
    private readonly verifyJwtUseCase: VerifyJwtUseCase,
  ) {}

  generate(payload: JwtPayload): string {
    return this.generateJwtUseCase.execute(payload);
  }

  verify(token: string): JwtToken {
    return this.verifyJwtUseCase.execute(token);
  }
}
