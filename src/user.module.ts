import { Module } from '@nestjs/common';
import { UsersController } from './adapters/in/user.controller';
import { UserService } from './application/core/service/user.service';
import { USERS_REPOSITORY } from './constants';
import { UserMemoryRepository } from './adapters/out/userMemory.repository';
import { CreateUserUseCase } from './application/ports/in/createUser.useCase';
import { GetUserUseCase } from './application/ports/in/getUser.useCase';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    UserService,
    CreateUserUseCase,
    GetUserUseCase,
    { provide: USERS_REPOSITORY, useClass: UserMemoryRepository },
  ],
})
export class AppModule {}
