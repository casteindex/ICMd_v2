// tests/setup/setupFiles.js
// Set test environment variables BEFORE any application or Prisma modules are loaded.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-12345';

const path = require('path');
const testDbPath = path.resolve(__dirname, '../../prisma/test.db').replace(/\\/g, '/');
process.env.DATABASE_URL = `file:${testDbPath}`;

// CONFIRMATION OF DB ISOLATION:
// test.db is completely isolated from dev.db.
// The dedicated Prisma client instantiated in helpers/db.js targets only test.db.
// By injecting it into require.cache for src/config/db, all Express controllers
// will query test.db and NEVER touch dev.db.

const { prisma } = require('../helpers/db');
const dbConfigPath = require.resolve('../../src/config/db');

require.cache[dbConfigPath] = {
  id: dbConfigPath,
  filename: dbConfigPath,
  loaded: true,
  exports: prisma,
};
