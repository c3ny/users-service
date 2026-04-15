import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard, JwtPayload } from './guards/jwt-auth.guard';
import { CompanyOwnerGuard } from './guards/company-owner.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  UpdateCompanyDto,
  UpdateCompanyImageDto,
} from './dto/update-company.dto';
import { CompanyPublicResponseDto } from './dto/company-response.dto';
import { ListCompaniesQueryDto } from './dto/list-companies-query.dto';
import {
  CompanyListItemDto,
  PaginatedCompaniesResponseDto,
} from './dto/list-companies-response.dto';
import { GetCompanyBySlugUseCase } from '@/application/ports/in/company/getCompanyBySlug.useCase';
import { GetCompanyByUserIdUseCase } from '@/application/ports/in/company/getCompanyByUserId.useCase';
import { ListActiveCompaniesUseCase } from '@/application/ports/in/company/listActiveCompanies.useCase';
import { UpdateCompanyUseCase } from '@/application/ports/in/company/updateCompany.useCase';
import { UpdateCompanyImageUseCase } from '@/application/ports/in/company/updateCompanyImage.useCase';
import { Company } from '@/application/core/domain/company.entity';
import { ErrorsEnum } from '@/application/core/errors/errors.enum';
import { AppLoggerService } from '@/shared/logger/app-logger.service';

@ApiTags('Companies')
@Controller('/companies')
export class CompanyController {
  constructor(
    private readonly getCompanyBySlugUseCase: GetCompanyBySlugUseCase,
    private readonly getCompanyByUserIdUseCase: GetCompanyByUserIdUseCase,
    private readonly listActiveCompaniesUseCase: ListActiveCompaniesUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly updateCompanyImageUseCase: UpdateCompanyImageUseCase,
    private readonly logger: AppLoggerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista hemocentros ativos (público)' })
  async list(
    @Query() query: ListCompaniesQueryDto,
  ): Promise<PaginatedCompaniesResponseDto> {
    const result = await this.listActiveCompaniesUseCase.execute({
      city: query.city,
      uf: query.uf,
      page: query.page,
      limit: query.limit,
    });

    if (!result.isSuccess) {
      throw new HttpException(
        'Erro ao listar hemocentros',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const { companies, total } = result.value;

    return {
      data: companies.map((c) => this.toListItemDto(c)),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  // Rotas estáticas (/me, /me/banner, /me/logo) ANTES do param dinâmico (:slug)
  // para evitar que o NestJS capture "me" como valor de slug.

  @Get('me')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna dados da própria empresa (logado)' })
  async getMe(
    @CurrentUser() user: JwtPayload,
  ): Promise<CompanyPublicResponseDto> {
    const result = await this.getCompanyByUserIdUseCase.execute(user.id);

    if (!result.isSuccess) {
      throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }

    return this.toPublicDto(result.value);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Atualiza dados do perfil público da própria empresa',
  })
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCompanyDto,
  ): Promise<CompanyPublicResponseDto> {
    const result = await this.updateCompanyUseCase.execute(
      user.companyId!,
      user.id,
      dto,
    );

    if (!result.isSuccess) {
      this.handleUpdateError(result.error);
    }

    this.logger.info('Company profile updated', { companyId: user.companyId });

    return this.toPublicDto(result.value);
  }

  @Patch('me/banner')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Atualiza imagem de capa da empresa' })
  async updateBanner(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCompanyImageDto,
  ): Promise<CompanyPublicResponseDto> {
    const result = await this.updateCompanyImageUseCase.execute(
      user.companyId!,
      user.id,
      'banner',
      dto.imageUrl,
    );

    if (!result.isSuccess) {
      this.handleUpdateError(result.error);
    }

    return this.toPublicDto(result.value);
  }

  @Patch('me/logo')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Atualiza logotipo/foto de perfil da empresa' })
  async updateLogo(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCompanyImageDto,
  ): Promise<CompanyPublicResponseDto> {
    const result = await this.updateCompanyImageUseCase.execute(
      user.companyId!,
      user.id,
      'logo',
      dto.imageUrl,
    );

    if (!result.isSuccess) {
      this.handleUpdateError(result.error);
    }

    return this.toPublicDto(result.value);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Retorna perfil público de um hemocentro pelo slug',
  })
  @ApiParam({ name: 'slug', description: 'Slug único do hemocentro' })
  async getBySlug(
    @Param('slug') slug: string,
  ): Promise<CompanyPublicResponseDto> {
    const result = await this.getCompanyBySlugUseCase.execute(slug);

    if (!result.isSuccess) {
      throw new HttpException(
        result.error === ErrorsEnum.CompanyNotFoundError
          ? 'Hemocentro não encontrado'
          : 'Erro ao buscar hemocentro',
        result.error === ErrorsEnum.CompanyNotFoundError
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return this.toPublicDto(result.value);
  }

  private toPublicDto(company: Company): CompanyPublicResponseDto {
    return {
      id: company.id,
      slug: company.slug,
      institutionName: company.institutionName,
      cnpj: company.cnpj,
      cnes: company.cnes,
      type: company.type,
      status: company.status,
      description: company.description,
      bannerImage: company.bannerImage,
      logoImage: company.logoImage,
      phone: company.phone,
      whatsapp: company.whatsapp,
      contactEmail: company.contactEmail,
      website: company.website,
      address: company.address,
      neighborhood: company.neighborhood,
      city: company.city,
      uf: company.uf,
      zipcode: company.zipcode,
      latitude: company.latitude,
      longitude: company.longitude,
      schedule: company.schedule,
      acceptsDonations: company.acceptsDonations ?? true,
      acceptsScheduling: company.acceptsScheduling ?? true,
    };
  }

  private toListItemDto(company: Company): CompanyListItemDto {
    return {
      id: company.id,
      slug: company.slug,
      institutionName: company.institutionName,
      type: company.type,
      logoImage: company.logoImage,
      city: company.city,
      uf: company.uf,
      acceptsDonations: company.acceptsDonations,
      acceptsScheduling: company.acceptsScheduling,
    };
  }

  private handleUpdateError(error: ErrorsEnum): never {
    if (error === ErrorsEnum.CompanyUnauthorizedError) {
      throw new HttpException('Acesso não autorizado', HttpStatus.FORBIDDEN);
    }
    if (error === ErrorsEnum.CompanyNotFoundError) {
      throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }
    throw new HttpException('Erro interno', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
