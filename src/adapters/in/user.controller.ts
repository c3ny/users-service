import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { User } from 'src/application/core/domain/user.entity';
import { ErrorsEnum } from 'src/application/core/errors/errors.enum';
import { UsersService } from 'src/application/core/service/users.service';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User | null> {
    const user = await this.usersService.getUserById(id);

    if (!user.isSuccess) {
      switch (user.error) {
        case ErrorsEnum.UserNotFoundError:
          throw new HttpException(user.error, HttpStatus.NOT_FOUND);
        default:
          throw new HttpException(user.error, HttpStatus.BAD_REQUEST);
      }
    }

    return user.value;
  }

  @Post()
  async createUser(@Body() user: Omit<User, 'id'>): Promise<User | null> {
    const result = await this.usersService.createUser(user);

    if (!result.isSuccess) {
      switch (result.error) {
        case ErrorsEnum.UserAlreadyExists:
          throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
        case ErrorsEnum.UserNotFoundError:
          throw new HttpException(result.error, HttpStatus.NOT_FOUND);
        default:
          throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
      }
    }

    return result.value;
  }

  @Put('/change-password/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() user: { password: string; newPassword: string },
  ): Promise<User> {
    const result = await this.usersService.changePassword(id, user);

    if (!result.isSuccess) {
      switch (result.error) {
        case ErrorsEnum.UserNotFound:
          throw new HttpException(result.error, HttpStatus.NOT_FOUND);
        case ErrorsEnum.InvalidPassword:
          throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
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
      switch (result.error) {
        case ErrorsEnum.InvalidPassword:
          throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
        case ErrorsEnum.UserNotFound:
          throw new HttpException(result.error, HttpStatus.NOT_FOUND);
        default:
          throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
      }
    }

    return result.value;
  }
}
