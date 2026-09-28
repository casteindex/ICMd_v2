const { execSync } = require('child_process');
const path = require('path');

module.exports = async function globalSetup() {
  const e2eDbPath = path
    .resolve(__dirname, '../../servidor/prisma/e2e.db')
    .replace(/\\/g, '/');
  const e2eDbUrl = `file:${e2eDbPath}`;
  const configPath = path.resolve(
    __dirname,
    '../../servidor/tests/setup/prisma.test.config.ts'
  );
  const serverDir = path.resolve(__dirname, '../../servidor');

  console.log('\n[Playwright GlobalSetup] Migrating and seeding e2e.db...');

  // 1. Run migrations on e2e.db
  try {
    execSync(`npx prisma migrate deploy --config "${configPath}"`, {
      cwd: serverDir,
      env: {
        ...process.env,
        DATABASE_URL: e2eDbUrl,
      },
      stdio: 'inherit',
    });
  } catch (err) {
    console.error('[Playwright GlobalSetup] Migration error on e2e.db:', err);
    throw err;
  }

  // 2. Run seed on e2e.db
  try {
    execSync(`node prisma/seed.js`, {
      cwd: serverDir,
      env: {
        ...process.env,
        DATABASE_URL: e2eDbUrl,
      },
      stdio: 'inherit',
    });
    console.log('[Playwright GlobalSetup] e2e.db seeded successfully.\n');
  } catch (err) {
    console.error('[Playwright GlobalSetup] Seeding error on e2e.db:', err);
    throw err;
  }
};
