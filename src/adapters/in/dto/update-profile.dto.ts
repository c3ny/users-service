import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Gender } from '@/application/types/user.types';

/**
 * DTO para PATCH /users/:id — edição de perfil pelo próprio usuário.
 * Todos os campos são opcionais (atualização parcial). Campos ausentes
 * permanecem inalterados; campos vazios ('') limpam o valor.
 *
 * Campos gender e lastDonationDate só fazem sentido para personType=DONOR
 * e são aplicados na tabela `donor` pelo service.
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'João Silva' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Phone — apenas dígitos: DDD + número',
    example: '11999998888',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'Phone must contain 10 or 11 digits (DDD + número)',
  })
  phone?: string;

  @ApiPropertyOptional({ example: 'São Paulo' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, {
    message: 'UF must be exactly 2 uppercase letters',
  })
  uf?: string;

  @ApiPropertyOptional({ example: '01310100' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$/, { message: 'CEP must contain 8 digits' })
  zipcode?: string;

  @ApiPropertyOptional({
    description:
      'Texto livre sobre o doador — usado por matching futuro LLM+RAG',
    example: 'Doador desde 2015, faço doações regulares na Fundação Pró-Sangue.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must be at most 2000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Sexo biologico do doador (aplicado apenas a DONOR).',
    enum: Gender,
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'gender must be MALE or FEMALE' })
  gender?: Gender;

  @ApiPropertyOptional({
    description:
      'Data da ultima doacao (YYYY-MM-DD). Enviar null para limpar (nunca doou).',
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
}
