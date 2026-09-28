const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const testDbPath = path.resolve(__dirname, '../../prisma/test.db').replace(/\\/g, '/');
const testDbUrl = `file:${testDbPath}`;

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: testDbUrl,
  }),
});

/**
 * Resets all tables in test.db in strict foreign-key order
 */
async function resetDb() {
  await prisma.report.deleteMany();
  await prisma.station.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Disconnects Prisma client
 */
async function disconnectDb() {
  await prisma.$disconnect();
}

module.exports = {
  prisma,
  resetDb,
  disconnectDb,
  testDbUrl,
};
