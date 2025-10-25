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
  UseGuards,
  UseInterceptors,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { User } from '@/application/core/domain/user.entity';
import { ErrorsEnum } from '@/application/core/errors/errors.enum';
import { UsersService } from '@/application/core/service/users.service';
import { CreateUserRequest } from '@/application/types/user.types';
import { JwtAuthGuard, JwtPayload } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  CreateDonorDto,
  ChangePasswordDto,
  AuthenticateDto,
} from './dto/create-user.dto';
import {
  UserResponseDto,
  AuthResponseDto,
  ErrorResponseDto,
} from './dto/user-response.dto';

@ApiTags('Users')
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is running',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-17T10:30:00.000Z' },
        service: { type: 'string', example: 'users-service' },
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'users-service',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Retrieve user profile information by user ID. Users can only access their own data.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '50f05b0c-5ce0-4920-9960-11f733f713a7',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Attempting to access another user's data",
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  async getUserById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<User | null> {
    // Users can only access their own data
    if (user.id !== id) {
      throw new ForbiddenException('You can only access your own data');
    }

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
  @ApiOperation({
    summary: 'Create user (Register)',
    description:
      'Create a new user account (donor or company). This endpoint supports both donor and company registration with different required fields.',
  })
  @ApiBody({
    description: 'User registration data',
    type: CreateDonorDto,
    examples: {
      donor: {
        summary: 'Donor Registration',
        description: 'Example of donor registration data',
        value: {
          email: 'donor@example.com',
          password: 'SecurePassword123!',
          name: 'João Silva',
          city: 'São Paulo',
          uf: 'SP',
          zipcode: '01310-100',
          personType: 'DONOR',
          cpf: '123.456.789-00',
          bloodType: 'O+',
          birthDate: '1990-05-15',
        },
      },
      company: {
        summary: 'Company Registration',
        description: 'Example of company registration data',
        value: {
          email: 'hospital@example.com',
          password: 'SecurePassword123!',
          name: 'Hospital São Paulo',
          city: 'São Paulo',
          uf: 'SP',
          zipcode: '01310-100',
          personType: 'COMPANY',
          cnpj: '12.345.678/0001-90',
          institutionName: 'Hospital São Paulo',
          cnes: '1234567',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 206,
    description: 'User created but profile creation failed (partial success)',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - User already exists or invalid data',
    type: ErrorResponseDto,
  })
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change password',
    description:
      "Change the authenticated user's password. Users can only change their own password.",
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '50f05b0c-5ce0-4920-9960-11f733f713a7',
  })
  @ApiBody({
    description: 'Password change data',
    type: ChangePasswordDto,
    examples: {
      changePassword: {
        summary: 'Change Password',
        description: 'Example of password change request',
        value: {
          old: 'OldPassword123!',
          new: 'NewPassword456!',
        },
      },
    },
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid old password',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Attempting to change another user's password",
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  async changePassword(
    @Param('id') id: string,
    @Body() passwords: { old: string; new: string },
    @CurrentUser() user: JwtPayload,
  ): Promise<User> {
    // Users can only change their own password
    if (user.id !== id) {
      throw new ForbiddenException('You can only change your own password');
    }

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
  @ApiOperation({
    summary: 'Authenticate user (Login)',
    description:
      'Authenticate a user and receive a JWT token for accessing protected endpoints.',
  })
  @ApiBody({
    description: 'User login credentials',
    type: AuthenticateDto,
    examples: {
      login: {
        summary: 'User Login',
        description: 'Example of user login request',
        value: {
          email: 'user@example.com',
          password: 'SecurePassword123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid password',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
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
  @UseGuards(JwtAuthGuard)
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
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file?: { filename: string; mimetype: string },
  ): Promise<User> {
    // Users can only upload their own avatar
    if (user.id !== id) {
      throw new ForbiddenException('You can only upload your own avatar');
    }

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
