import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adiciona coluna phone (varchar 20, nullable) na tabela users.
 *
 * Em dev local synchronize=true aplica isso automaticamente. Em producao
 * (Neon/Heroku NODE_ENV=production), rodar manualmente:
 *   ALTER TABLE users ADD COLUMN phone varchar(20);
 *
 * Coluna fica nullable porque usuarios antigos nao tem telefone — eles
 * serao obrigados a preencher na proxima atualizacao de perfil.
 */
export class AddPhoneToUsers1744810100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar(20)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
  }
}
