import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { User } from 'src/application/core/domain/user.entity';
import { UsersService } from 'src/application/core/service/users.service';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User | null> {
    const user = await this.usersService.getUserById(id);

    if (!user.isSuccess) {
      throw new HttpException(user.error, HttpStatus.BAD_REQUEST);
    }

    return user.value;
  }

  @Post()
  async createUser(@Body() user: Omit<User, 'id'>): Promise<User | null> {
    const result = await this.usersService.createUser(user);

    if (!result.isSuccess) {
      switch (result.error) {
        case 'UserAlreadyExists':
          throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
        case 'UserNotFoundError':
          throw new HttpException(result.error, HttpStatus.NOT_FOUND);
        default:
          throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
      }
    }

    return result.value;
  }

  @Post('authenticate')
  async authenticate(
    @Body() user: Pick<User, 'email' | 'password'>,
  ): Promise<User> {
    const result = await this.usersService.authenticate(user);

    if (!result.isSuccess) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    return result.value;
  }
}
