import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';
import { PersonType, Gender } from '@/application/types/user.types';

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

  @ApiProperty({
    description: 'Phone number — apenas dígitos: DDD + número',
    example: '11999998888',
  })
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'Phone must contain 10 or 11 digits (DDD + número)',
  })
  phone: string;

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

  @ApiPropertyOptional({
    description:
      'Sexo biologico do doador. Obrigatorio quando personType=DONOR (validado no service).',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'gender must be MALE or FEMALE' })
  gender?: Gender;

  @ApiPropertyOptional({
    description:
      'Data da ultima doacao (YYYY-MM-DD). Omitir/null se nunca doou.',
    example: '2025-03-01',
    nullable: true,
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'lastDonationDate must be a valid date in YYYY-MM-DD format',
    },
  )
  lastDonationDate?: string | null;

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
