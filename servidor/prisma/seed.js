/**
 * Default credentials:
 * Email: admin@unitec.edu (or process.env.ADMIN_EMAIL)
 * Password: Unitec2026! (or process.env.ADMIN_PASSWORD)
 */
const bcrypt = require('bcrypt');

async function seed(prisma) {
  console.log('Iniciando database seed...');

  // 1. Limpiar en orden de dependencias
  await prisma.report.deleteMany();
  await prisma.station.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  // 2. Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@unitec.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Unitec2026!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador General',
      email: adminEmail,
      passwordHash: passwordHash,
    },
  });
  console.log(`Admin creado: ${admin.email}`);

  // 3. Class 1: Programación Web Avanzada
  const classA = await prisma.class.create({
    data: {
      code: 'ISO-2026-A',
      name: 'Programación Web Avanzada',
      section: 'Sec-01',
      location: 'Laboratorio 301',
      schedule: 'Lun-Mie 08:00-10:00',
      active: true,
    },
  });

  const stationA1 = await prisma.station.create({
    data: {
      code: 'EST-01',
      name: 'Estación 01',
      location: 'Fila 1 - Izquierda',
      operatingSystem: 'WINDOWS',
      ignored: false,
      classId: classA.id,
    },
  });

  const stationA2 = await prisma.station.create({
    data: {
      code: 'EST-02',
      name: 'Estación 02',
      location: 'Fila 1 - Derecha',
      operatingSystem: 'LINUX',
      ignored: false,
      classId: classA.id,
    },
  });

  const stationA3 = await prisma.station.create({
    data: {
      code: 'EST-03',
      name: 'Estación 03',
      location: 'Fila 2 - Izquierda',
      operatingSystem: 'WINDOWS',
      ignored: false,
      classId: classA.id,
    },
  });

  // Reportes para Clase 1
  await prisma.report.create({
    data: {
      declaredStatus: 'OK',
      agentVersion: '1.0.0',
      ipAddress: '192.168.1.101',
      cpuPercent: 25,
      memoryPercent: 40,
      stationId: stationA1.id,
      createdAt: new Date(),
    },
  });

  await prisma.report.create({
    data: {
      declaredStatus: 'INTERNET',
      agentVersion: '1.0.0',
      ipAddress: '192.168.1.102',
      cpuPercent: 55,
      memoryPercent: 60,
      stationId: stationA2.id,
      createdAt: new Date(),
    },
  });

  await prisma.report.create({
    data: {
      declaredStatus: 'OK',
      agentVersion: '1.0.0',
      ipAddress: '192.168.1.103',
      cpuPercent: 15,
      memoryPercent: 30,
      stationId: stationA3.id,
      createdAt: new Date(Date.now() - 30000), // 30s ago (ADVERTENCIA)
    },
  });

  // 4. Clase 2: Sistemas Distribuidos
  const classB = await prisma.class.create({
    data: {
      code: 'ISO-2026-B',
      name: 'Sistemas Distribuidos',
      section: 'Sec-02',
      location: 'Laboratorio 302',
      schedule: 'Mar-Jue 10:00-12:00',
      active: true,
    },
  });

  const stationB1 = await prisma.station.create({
    data: {
      code: 'EST-01',
      name: 'Estación B01',
      location: 'Mesa 1',
      operatingSystem: 'MACOS',
      ignored: false,
      classId: classB.id,
    },
  });

  const stationB2 = await prisma.station.create({
    data: {
      code: 'EST-02',
      name: 'Estación B02',
      location: 'Mesa 2',
      operatingSystem: 'CHROMEOS',
      ignored: false,
      classId: classB.id,
    },
  });

  const stationB3 = await prisma.station.create({
    data: {
      code: 'EST-03',
      name: 'Estación B03',
      location: 'Mesa 3',
      operatingSystem: 'LINUX',
      ignored: true,
      classId: classB.id,
    },
  });

  // Reports para Class 2
  await prisma.report.create({
    data: {
      declaredStatus: 'IA',
      agentVersion: '1.0.0',
      ipAddress: '192.168.2.101',
      cpuPercent: 80,
      memoryPercent: 85,
      stationId: stationB1.id,
      createdAt: new Date(),
    },
  });

  await prisma.report.create({
    data: {
      declaredStatus: 'OK',
      agentVersion: '1.0.0',
      ipAddress: '192.168.2.102',
      cpuPercent: 20,
      memoryPercent: 35,
      stationId: stationB2.id,
      createdAt: new Date(),
    },
  });

  await prisma.report.create({
    data: {
      declaredStatus: 'OK',
      agentVersion: '1.0.0',
      ipAddress: '192.168.2.103',
      cpuPercent: 10,
      memoryPercent: 20,
      stationId: stationB3.id,
      createdAt: new Date(),
    },
  });

  console.log(
    'Seed completado: se crearon 2 classes, 6 estaciones y sample reports.'
  );
  return {
    admin,
    classA,
    classB,
    stationA1,
    stationA2,
    stationA3,
    stationB1,
    stationB2,
    stationB3,
  };
}

if (require.main === module) {
  const { PrismaClient } = require('@prisma/client');
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  const prismaClient = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: dbUrl }),
  });

  seed(prismaClient)
    .then(async () => {
      await prismaClient.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('Seed error:', e);
      await prismaClient.$disconnect();
      process.exit(1);
    });
}

module.exports = { seed };
