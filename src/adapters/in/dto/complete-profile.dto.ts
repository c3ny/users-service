import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { PersonType } from '@/application/types/user.types';

export class CompleteProfileDto {
  @ApiProperty({ enum: PersonType })
  @IsEnum(PersonType)
  personType: PersonType;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  uf: string;

  // Donor fields
  @ApiProperty({ example: '123.456.789-00', required: false })
  @IsString()
  @IsOptional()
  cpf?: string;

  @ApiProperty({ example: 'O+', required: false })
  @IsString()
  @IsOptional()
  bloodType?: string;

  @ApiProperty({ example: '1990-05-15', required: false })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  // Company fields
  @ApiProperty({ example: '12.345.678/0001-90', required: false })
  @IsString()
  @IsOptional()
  cnpj?: string;

  @ApiProperty({ example: 'Hospital São Paulo', required: false })
  @IsString()
  @IsOptional()
  institutionName?: string;

  @ApiProperty({ example: '1234567', required: false })
  @IsString()
  @IsOptional()
  cnes?: string;
}
