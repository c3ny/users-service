import { Module } from '@nestjs/common';
import { UsersController } from './adapters/in/user.controller';
import { UserService } from './application/core/service/user.service';
import { USERS_REPOSITORY } from './constants';
import { CreateUserUseCase } from './application/ports/in/createUser.useCase';
import { GetUserUseCase } from './application/ports/in/getUser.useCase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './adapters/out/users.repository';
import { Users } from './adapters/out/domain/user.entity';

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
  ],
  controllers: [UsersController],
  providers: [
    UserService,
    CreateUserUseCase,
    GetUserUseCase,
    { provide: USERS_REPOSITORY, useClass: UsersRepository },
  ],
})
export class AppModule {}
