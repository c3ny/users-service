import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PersonType } from 'src/application/types/user.types';

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '50f05b0c-5ce0-4920-9960-11f733f713a7',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'User city',
    example: 'São Paulo',
  })
  city: string;

  @ApiProperty({
    description: 'State code',
    example: 'SP',
  })
  uf: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '01310-100',
  })
  zipcode?: string;

  @ApiProperty({
    description: 'Type of person',
    enum: PersonType,
    example: PersonType.DONOR,
  })
  personType: PersonType;

  @ApiPropertyOptional({
    description: 'Path to avatar image',
    example: '/uploads/avatar-1234567890-123456789.jpg',
  })
  avatarPath?: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'JWT authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'USER_ALREADY_EXISTS',
  })
  message: string;
}
