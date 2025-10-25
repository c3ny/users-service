import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  Matches,
} from 'class-validator';
import { PersonType } from '@/application/types/user.types';

export class BaseCreateUserDto {
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
    minLength: 8,
  })
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'João Silva',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User city',
    example: 'São Paulo',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'State code (2 letters)',
    example: 'SP',
    pattern: '^[A-Z]{2}$',
  })
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'UF must be exactly 2 uppercase letters' })
  uf: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '01310-100',
  })
  @IsOptional()
  @IsString()
  zipcode?: string;

  @ApiProperty({
    description: 'Type of person',
    enum: PersonType,
    example: PersonType.DONOR,
  })
  @IsEnum(PersonType, { message: 'personType must be either DONOR or COMPANY' })
  personType: PersonType;
}

export class CreateDonorDto extends BaseCreateUserDto {
  @ApiProperty({
    description: 'Person type - must be DONOR',
    enum: PersonType,
    example: PersonType.DONOR,
  })
  @IsEnum([PersonType.DONOR], {
    message: 'personType must be DONOR for donor registration',
  })
  declare personType: PersonType.DONOR;

  @ApiProperty({
    description: 'Brazilian CPF (11 digits)',
    example: '123.456.789-00',
    pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$',
  })
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF must be in format 123.456.789-00',
  })
  cpf: string;

  @ApiProperty({
    description: 'Blood type',
    example: 'O+',
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  })
  @IsString()
  @Matches(/^(A|B|AB|O)[+-]$/, {
    message: 'Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-',
  })
  bloodType: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '1990-05-15',
    format: 'date',
  })
  @IsDateString(
    {},
    { message: 'birthDate must be a valid date in YYYY-MM-DD format' },
  )
  birthDate: string;
}

export class CreateCompanyDto extends BaseCreateUserDto {
  @ApiProperty({
    description: 'Person type - must be COMPANY',
    enum: PersonType,
    example: PersonType.COMPANY,
  })
  @IsEnum([PersonType.COMPANY], {
    message: 'personType must be COMPANY for company registration',
  })
  declare personType: PersonType.COMPANY;

  @ApiProperty({
    description: 'Brazilian CNPJ (14 digits)',
    example: '12.345.678/0001-90',
    pattern: '^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$',
  })
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ must be in format 12.345.678/0001-90',
  })
  cnpj: string;

  @ApiProperty({
    description: 'Official institution name',
    example: 'Hospital São Paulo',
  })
  @IsString()
  institutionName: string;

  @ApiProperty({
    description: 'National Health Establishment Code (CNES)',
    example: '1234567',
    pattern: '^\\d{7}$',
  })
  @IsString()
  @Matches(/^\d{7}$/, { message: 'CNES must be exactly 7 digits' })
  cnes: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'OldPassword123!',
  })
  @IsString()
  old: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewPassword456!',
    minLength: 8,
  })
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  new: string;
}

export class AuthenticateDto {
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
}
