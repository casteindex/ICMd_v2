import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    testTimeout: 15000,
    include: ['tests/**/*.test.js'],
    globalSetup: ['tests/setup/globalSetup.js'],
    setupFiles: ['tests/setup/setupFiles.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/config/swagger.js', 'src/server.js'],
    },
  },
});
