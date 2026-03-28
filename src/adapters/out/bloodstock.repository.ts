import { Injectable } from '@nestjs/common';

@Injectable()
export class BloodstockRepository {
  private readonly bloodstockUrl = process.env.BLOODSTOCK_SERVICE_URL;

  async initializeCompanyStock(payload: {
    companyId: string;
    cnpj: string;
    cnes: string;
    institutionName: string;
  }): Promise<void> {
    try {
      const response = await fetch(`${this.bloodstockUrl}/api/stock/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': process.env.INTERNAL_SECRET ?? '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(
          '[Bloodstock Webhook] Falhou:',
          response.status,
          await response.text(),
        );
      } else {
        console.log('[Bloodstock Webhook] Estoque inicializado com sucesso');
      }
    } catch (error) {
      console.error(
        '[Bloodstock Webhook] Erro ao chamar bloodstock-service:',
        error,
      );
    }
  }
}
