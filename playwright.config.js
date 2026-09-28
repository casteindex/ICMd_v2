const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

const e2eDbPath = path
  .resolve(__dirname, 'servidor/prisma/e2e.db')
  .replace(/\\/g, '/');
const e2eDbUrl = `file:${e2eDbPath}`;

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 7000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  globalSetup: require.resolve('./e2e/setup/globalSetup.js'),
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `npx cross-env PORT=3000 DATABASE_URL="${e2eDbUrl}" JWT_SECRET="e2e-jwt-secret-key-12345" node servidor/src/server.js`,
      port: 3000,
      timeout: 30000,
      reuseExistingServer: false,
    },
    {
      command: 'npm --prefix cliente run dev -- --port 5173 --host',
      port: 5173,
      timeout: 30000,
      reuseExistingServer: false,
    },
  ],
});
