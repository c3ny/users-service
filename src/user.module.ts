import { Module } from '@nestjs/common';
import { UsersController } from './adapters/in/user.controller';
import {
  COMPANY_REPOSITORY,
  DONOR_REPOSITORY,
  USERS_REPOSITORY,
} from './constants';
import { CreateUserUseCase } from './application/ports/in/user/createUser.useCase';
import { GetUserUseCase } from './application/ports/in/user/getUser.useCase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './adapters/out/users.repository';
import { Users } from './adapters/out/domain/user.entity';
import { GetUserByEmailUseCase } from './application/ports/in/user/getUserByEmail.useCase';
import { HashModule } from './modules/Hash/hash.module';
import { UsersService } from './application/core/service/users.service';
import { ChangePasswordUseCase } from './application/ports/in/user/changePassword.useCase';
import { ChangeUserDataUseCase } from './application/ports/in/user/changeUserData.useCase';
import { DonorRepository } from './adapters/out/donor.repository';
import { Donors } from './adapters/out/domain/donor.entity';
import { CreateDonorUseCase } from './application/ports/in/donor/createDonor.useCase';
import { Companies } from './adapters/out/domain/company.entity';
import { CompanyRepository } from './adapters/out/company.repository';
import { CreateCompanyUseCase } from './application/ports/in/company/createCompany.useCase';
import { UpdateUserAvatarUseCase } from './application/ports/in/user/updateUserAvatar.useCase';
import { HealthModule } from './modules/Health/health.module';
import { GetCompanyByUserIdUseCase } from './application/ports/in/company/getCompanyByUserId.useCase';
import { BloodstockRepository } from './adapters/out/bloodstock.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Users, Donors, Companies],
      synchronize: true,
      ssl: process.env.DATABASE_URL?.includes('heroku')
        ? { rejectUnauthorized: false }
        : false,
    }),
    TypeOrmModule.forFeature([Users, Donors, Companies]),
    HashModule,
    HealthModule,
  ],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    GetUserUseCase,
    GetUserByEmailUseCase,
    UsersService,
    ChangePasswordUseCase,
    ChangeUserDataUseCase,
    CreateDonorUseCase,
    CreateCompanyUseCase,
    GetCompanyByUserIdUseCase,
    UpdateUserAvatarUseCase,
    BloodstockRepository,
    { provide: USERS_REPOSITORY, useClass: UsersRepository },
    { provide: DONOR_REPOSITORY, useClass: DonorRepository },
    { provide: COMPANY_REPOSITORY, useClass: CompanyRepository },
  ],
})
export class AppModule {}
