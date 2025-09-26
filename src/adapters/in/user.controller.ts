import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { User } from 'src/application/core/domain/user.entity';
import { ErrorsEnum } from 'src/application/core/errors/errors.enum';
import { UsersService } from 'src/application/core/service/users.service';
import { CreateUserRequest } from 'src/application/types/user.types';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User | null> {
    const result = await this.usersService.getUserById(id);

    if (!result.isSuccess) {
      switch (result.error) {
        case ErrorsEnum.UserNotFoundError:
          throw new HttpException(result.error, HttpStatus.NOT_FOUND);
        default:
          throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
      }
    }

    return result.value;
  }

  @Post()
  async createUser(
    @Body() user: CreateUserRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<User | null> {
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

    res.status(
      result.isPartialSuccess ? HttpStatus.PARTIAL_CONTENT : HttpStatus.CREATED,
    );

    return result.value;
  }

  @Put('/change-password/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() passwords: { old: string; new: string },
  ): Promise<User> {
    const result = await this.usersService.changePassword(id, passwords);

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
