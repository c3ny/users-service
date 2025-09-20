import { DataSource } from 'typeorm';
import { Users } from './adapters/out/domain/user.entity';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: String(process.env.POSTGRES_USERNAME),
  password: String(process.env.POSTGRES_PASSWORD),
  database: String(process.env.POSTGRES_DATABASE),
  entities: [Users],
  migrations: ['src/migrations/*.ts'],
});
