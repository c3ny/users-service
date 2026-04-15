import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CompanyType,
  CompanySchedule,
} from '@/application/core/domain/company.entity';

export class CompanyScheduleDto implements CompanySchedule {
  @IsIn([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ])
  dayOfWeek: CompanySchedule['dayOfWeek'];

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  openTime: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  closeTime: string;

  @IsBoolean()
  isOpen: boolean;
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsIn(['HOSPITAL', 'BLOOD_CENTER', 'CLINIC'])
  type?: CompanyType;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'phone deve conter 10 ou 11 dígitos numéricos',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'whatsapp deve conter 10 ou 11 dígitos numéricos',
  })
  whatsapp?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  uf?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$/, { message: 'zipcode deve conter exatamente 8 dígitos' })
  zipcode?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CompanyScheduleDto)
  schedule?: CompanyScheduleDto[];

  @IsOptional()
  @IsBoolean()
  acceptsDonations?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptsScheduling?: boolean;
}

export class UpdateCompanyImageDto {
  @IsString()
  @Length(1, 500)
  imageUrl: string;
}
