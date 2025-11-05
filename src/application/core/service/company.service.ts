import { Injectable, NotFoundException } from '@nestjs/common';
import { GetCompanyByUserUseCase } from '../../../application/ports/in/company/getCompanyByUser.useCase';

@Injectable()
export class CompanyService {
  constructor(private readonly getCompanyByUserUseCase: GetCompanyByUserUseCase) {}

  async getByUserId(userId: string) {
    return await this.getCompanyByUserUseCase.execute(userId);
  }
}
