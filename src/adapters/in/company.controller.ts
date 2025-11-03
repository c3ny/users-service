import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CompanyRepository } from '../out/company.repository';
import { Company } from '@/application/core/domain/company.entity';
import { ErrorResponseDto } from './dto/user-response.dto';

@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyRepository: CompanyRepository) {}

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get company by user ID',
    description:
      'Returns the company information associated with a given user ID. Requires authentication.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User UUID',
    example: '50f05b0c-5ce0-4920-9960-11f733f713a7',
  })
  @ApiResponse({
    status: 200,
    description: 'Company found',
    type: Company,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
    type: ErrorResponseDto,
  })
  async getCompanyByUserId(@Param('userId') userId: string): Promise<Company> {
    const company = await this.companyRepository.findByUserId(userId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }
}
