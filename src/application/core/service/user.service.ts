import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { CreateUserUseCase } from 'src/application/ports/in/createUser.useCase';
import { GetUserUseCase } from 'src/application/ports/in/getUser.useCase';

@Injectable()
export class UserService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  getUserById(id: string): Promise<User | null> {
    return this.getUserUseCase.execute(id);
  }

  save(user: User): Promise<User> {
    return this.createUserUseCase.execute(user);
  }
}
