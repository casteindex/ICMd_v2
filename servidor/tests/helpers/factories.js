const bcrypt = require('bcrypt');
const { prisma } = require('./db');

let classCounter = 1;
let stationCounter = 1;
let userCounter = 1;

async function createUser(overrides = {}) {
  const count = userCounter++;
  const password = overrides.password || 'Password123!';
  const passwordHash = overrides.passwordHash || (await bcrypt.hash(password, 10));

  return prisma.user.create({
    data: {
      name: overrides.name || `User ${count}`,
      email: overrides.email || `user${count}_${Date.now()}@unitec.edu`,
      passwordHash: passwordHash,
      ...overrides,
    },
  });
}

async function createClass(overrides = {}) {
  const count = classCounter++;
  return prisma.class.create({
    data: {
      code: overrides.code || `CLS-${count}-${Date.now()}`,
      name: overrides.name || `Clase de Prueba ${count}`,
      section: overrides.section || `Sec-0${count}`,
      location: overrides.location || `Lab ${100 + count}`,
      schedule: overrides.schedule || 'Lun-Mie 08:00-10:00',
      active: overrides.active !== undefined ? overrides.active : true,
      ...overrides,
    },
  });
}

async function createStation(classId, overrides = {}) {
  const count = stationCounter++;
  return prisma.station.create({
    data: {
      code: overrides.code || `EST-0${count}`,
      name: overrides.name || `Estación ${count}`,
      location: overrides.location || `Mesa ${count}`,
      operatingSystem: overrides.operatingSystem || 'WINDOWS',
      ignored: overrides.ignored !== undefined ? overrides.ignored : false,
      classId: classId,
      ...overrides,
    },
  });
}

async function createReport(stationId, overrides = {}) {
  return prisma.report.create({
    data: {
      declaredStatus: overrides.declaredStatus || 'OK',
      agentVersion: overrides.agentVersion || '1.0.0',
      ipAddress: overrides.ipAddress || '192.168.1.100',
      cpuPercent: overrides.cpuPercent !== undefined ? overrides.cpuPercent : 20,
      memoryPercent: overrides.memoryPercent !== undefined ? overrides.memoryPercent : 40,
      createdAt: overrides.createdAt || new Date(),
      stationId: stationId,
      ...overrides,
    },
  });
}

module.exports = {
  createUser,
  createClass,
  createStation,
  createReport,
};
