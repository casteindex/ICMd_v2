import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalSetup() {
  const testDbUrl = `file:${path.resolve(__dirname, '../../prisma/test.db').replace(/\\/g, '/')}`;
  const configPath = path.resolve(__dirname, 'prisma.test.config.ts');
  const serverDir = path.resolve(__dirname, '../..');

  console.log('\n[Vitest GlobalSetup] Applying Prisma migrations to test.db...');
  try {
    execSync(`npx prisma migrate deploy --config "${configPath}"`, {
      cwd: serverDir,
      env: {
        ...process.env,
        DATABASE_URL: testDbUrl,
      },
      stdio: 'inherit',
    });
    console.log('[Vitest GlobalSetup] Migrations applied successfully to test.db.\n');
  } catch (err) {
    console.error('[Vitest GlobalSetup] Error deploying migrations to test.db:', err);
    throw err;
  }
}
