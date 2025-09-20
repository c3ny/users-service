import { Module } from '@nestjs/common';
import { HashStringUseCase } from './application/ports/in/hashString.useCase';
import { HASH_REPOSITORY, JWT_REPOSITORY } from './constants';
import { HashRepository } from './adapters/out/hash.repository';
import { GenerateJwtUseCase } from './application/ports/in/generateJwt.useCase';
import { CompareHashUseCase } from './application/ports/in/compareHash.useCase';
import { JwtRepository } from './adapters/out/jwt.repository';
import { VerifyJwtUseCase } from './application/ports/in/verifyJwt.useCase';
import { HashService } from './application/core/service/hash.service';
import { JwtService } from './application/core/service/jwt.service';

@Module({
  providers: [
    HashStringUseCase,
    GenerateJwtUseCase,
    CompareHashUseCase,
    VerifyJwtUseCase,
    HashService,
    JwtService,
    {
      provide: HASH_REPOSITORY,
      useClass: HashRepository,
    },
    {
      provide: JWT_REPOSITORY,
      useClass: JwtRepository,
    },
  ],
  exports: [
    HashStringUseCase,
    GenerateJwtUseCase,
    CompareHashUseCase,
    VerifyJwtUseCase,
  ],
})
export class HashModule {}
