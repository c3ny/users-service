import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adiciona colunas gender (varchar 8, nullable) e last_donation_date
 * (date, nullable) na tabela donor.
 *
 * Em dev local synchronize=true aplica isso automaticamente. Em producao
 * (Neon/Heroku NODE_ENV=production), migrationsRun=true roda no startup
 * via glob em src/user.module.ts. Fallback manual:
 *   ALTER TABLE donor ADD COLUMN gender varchar(8);
 *   ALTER TABLE donor ADD COLUMN last_donation_date date;
 *
 * gender: 'MALE' | 'FEMALE'. Obrigatorio para novos cadastros, nullable para
 * backfill de registros legados (usuario preenche depois via /perfil).
 *
 * last_donation_date: data da ultima doacao de sangue (null = nunca doou).
 * Usada para calcular intervalo minimo antes da proxima doacao:
 *   - MALE: 60 dias / ate 4 doacoes por ano (Anvisa)
 *   - FEMALE: 90 dias / ate 3 doacoes por ano (Anvisa)
 */
export class AddGenderAndLastDonationToDonors1744810300000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "donor" ADD COLUMN IF NOT EXISTS "gender" varchar(8)`,
    );
    await queryRunner.query(
      `ALTER TABLE "donor" ADD COLUMN IF NOT EXISTS "last_donation_date" date`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "donor" DROP COLUMN "last_donation_date"`,
    );
    await queryRunner.query(`ALTER TABLE "donor" DROP COLUMN "gender"`);
  }
}
