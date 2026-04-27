import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adiciona coluna description (text, nullable) na tabela users.
 *
 * Em dev local synchronize=true aplica isso automaticamente. Em producao
 * (Neon/Heroku NODE_ENV=production), rodar manualmente:
 *   ALTER TABLE users ADD COLUMN description text;
 *
 * Campo livre opcional para enriquecimento de perfil — futura feature LLM+RAG
 * fara matching de solicitacoes por similaridade textual.
 */
export class AddDescriptionToUsers1744810200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "description" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "description"`);
  }
}
