import { Module } from '@nestjs/common';
import { UsersController } from './adapters/in/user.controller';
import { USERS_REPOSITORY } from './constants';
import { CreateUserUseCase } from './application/ports/in/createUser.useCase';
import { GetUserUseCase } from './application/ports/in/getUser.useCase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './adapters/out/users.repository';
import { Users } from './adapters/out/domain/user.entity';
import { GetUserByEmailUseCase } from './application/ports/in/getUserByEmail.useCase';
import { HashModule } from './modules/Hash/hash.module';
import { UsersService } from './application/core/service/users.service';
import { ChangePasswordUseCase } from './application/ports/in/changePassword.useCase';
import { ChangeUserDataUseCase } from './application/ports/in/changeUserData.useCase';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: 5432,
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      entities: [Users],
    }),
    TypeOrmModule.forFeature([Users]),
    HashModule,
  ],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    GetUserUseCase,
    GetUserByEmailUseCase,
    UsersService,
    ChangePasswordUseCase,
    ChangeUserDataUseCase,
    { provide: USERS_REPOSITORY, useClass: UsersRepository },
  ],
})
export class AppModule {}
