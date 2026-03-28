import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class OAuthGoogleDto {
  @ApiProperty({
    description: 'Google OAuth access token obtained from Google Sign-In',
    example: 'ya29.a0AfH6SMBxxx...',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

export class OAuthAppleDto {
  @ApiProperty({
    description: 'Apple identity token obtained from Sign In with Apple',
    example: 'eyJraWQiOiJZdXlYb1kiLCJhbGciOiJSUzI1NiJ9...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiProperty({
    description: "User's first name (only provided on first Apple Sign In)",
    required: false,
    example: 'João',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: "User's last name (only provided on first Apple Sign In)",
    required: false,
    example: 'Silva',
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}
