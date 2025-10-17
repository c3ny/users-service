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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
  ): Promise<{ user: User; token: string }> {
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

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './temp/uploads',
        filename: (_req, file, cb) => {
          try {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(String(file.originalname));
            const filename = `avatar-${uniqueSuffix}${ext}`;
            cb(null, filename);
          } catch (error: unknown) {
            const err =
              error instanceof Error ? error : new Error(String(error));
            cb(err, '');
          }
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only JPEG and PNG images is allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file?: { filename: string; mimetype: string },
  ): Promise<User> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const avatarPath = `/uploads/${file.filename}`;

    const result = await this.usersService.uploadAvatar(id, avatarPath);

    if (!result.isSuccess) {
      switch (result.error) {
        case ErrorsEnum.UserNotFound:
          throw new HttpException(result.error, HttpStatus.NOT_FOUND);
        default:
          throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
      }
    }

    return result.value;
  }
}
