import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Aumenta donor.blood_type de varchar(4) para varchar(16) para acomodar
 * o novo valor 'UNKNOWN' (doadores que ainda nao sabem o tipo sanguineo).
 *
 * Em dev local synchronize=true aplica isso automaticamente. Em producao
 * (Neon/Heroku NODE_ENV=production), rodar manualmente:
 *   ALTER TABLE donor ALTER COLUMN blood_type TYPE varchar(16);
 */
export class AlterDonorBloodTypeLength1744810000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "donor" ALTER COLUMN "blood_type" TYPE varchar(16)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "donor" ALTER COLUMN "blood_type" TYPE varchar(4)`,
    );
  }
}
