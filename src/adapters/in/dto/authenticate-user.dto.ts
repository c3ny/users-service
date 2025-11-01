import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class AuthenticateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Remember me',
    example: true,
  })
  @IsBoolean()
  rememberMe: boolean;
}
