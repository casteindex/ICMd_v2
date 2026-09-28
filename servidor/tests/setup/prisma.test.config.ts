import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'prisma/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  schema: path.resolve(__dirname, '../../prisma/schema.prisma'),
  migrations: {
    path: path.resolve(__dirname, '../../prisma/migrations'),
  },
  datasource: {
    url:
      process.env.DATABASE_URL ||
      `file:${path.resolve(__dirname, '../../prisma/test.db').replace(/\\/g, '/')}`,
  },
});
