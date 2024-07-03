import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config({ path: '.env.local' });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'postgres',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
  // synchronize: false,
});
