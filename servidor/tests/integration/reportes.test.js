import { describe, it, expect, beforeEach, afterAll } from 'vitest';
const request = require('supertest');
const app = require('../../src/app');
const { resetDb, disconnectDb, prisma } = require('../helpers/db');
const { createTestAdmin } = require('../helpers/auth');
const { createClass, createStation } = require('../helpers/factories');

describe('Integration Tests — /api/stations/:id/reports', () => {
  let authHeader;
  let testClass;
  let testStation;

  beforeEach(async () => {
    await resetDb();
    const admin = await createTestAdmin();
    authHeader = admin.authHeader;
    testClass = await createClass({ code: 'ISO-REP-TEST' });
    testStation = await createStation(testClass.id, { code: 'EST-01' });
  });

  afterAll(async () => {
    await disconnectDb();
  });

  describe('8.2.7 — Ingesta de Reportes Heartbeat', () => {
    it('debe rechazar con 401 si se intenta enviar reporte sin autenticación', async () => {
      const res = await request(app)
        .post(`/api/stations/${testStation.id}/reports`)
        .send({
          declaredStatus: 'OK',
          agentVersion: '1.0.0',
          ipAddress: '192.168.1.50',
          cpuPercent: 30,
          memoryPercent: 50,
        });

      expect(res.status).toBe(401);
    });

    it('debe registrar un reporte válido con código 201 y retornar calculatedStatus y elapsedSeconds', async () => {
      const payload = {
        declaredStatus: 'OK',
        agentVersion: '1.0.0',
        ipAddress: '192.168.1.50',
        cpuPercent: 30,
        memoryPercent: 50,
      };

      const res = await request(app)
        .post(`/api/stations/${testStation.id}/reports`)
        .set(authHeader)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('lastReport');
      expect(res.body).toHaveProperty('calculatedStatus', 'OK');
      expect(res.body).toHaveProperty('elapsedSeconds');
      expect(res.body.lastReport.stationId).toBe(testStation.id);

      // Verificar persistencia en base de datos
      const reportsInDb = await prisma.report.findMany({
        where: { stationId: testStation.id },
      });
      expect(reportsInDb.length).toBe(1);
      expect(reportsInDb[0].declaredStatus).toBe('OK');
    });

    it('debe registrar un reporte con declaredStatus INTERNET y retornar calculatedStatus CRITICO', async () => {
      const payload = {
        declaredStatus: 'INTERNET',
        agentVersion: '1.0.0',
        ipAddress: '192.168.1.51',
        cpuPercent: 40,
        memoryPercent: 60,
      };

      const res = await request(app)
        .post(`/api/stations/${testStation.id}/reports`)
        .set(authHeader)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.calculatedStatus).toBe('CRITICO');
    });

    it('debe rechazar con 404 si la estación no existe', async () => {
      const res = await request(app)
        .post('/api/stations/99999/reports')
        .set(authHeader)
        .send({
          declaredStatus: 'OK',
          agentVersion: '1.0.0',
          ipAddress: '192.168.1.50',
          cpuPercent: 30,
          memoryPercent: 50,
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('No existe');
    });

    it('debe rechazar con 400 si los datos del reporte están incompletos', async () => {
      const res = await request(app)
        .post(`/api/stations/${testStation.id}/reports`)
        .set(authHeader)
        .send({
          declaredStatus: 'OK',
          // falta agentVersion, ipAddress, cpuPercent, memoryPercent
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Datos incompletos');
    });

    it('debe rechazar con 400 si el declaredStatus no es válido (ej. UNKNOWN)', async () => {
      const res = await request(app)
        .post(`/api/stations/${testStation.id}/reports`)
        .set(authHeader)
        .send({
          declaredStatus: 'DESCONOCIDO',
          agentVersion: '1.0.0',
          ipAddress: '192.168.1.50',
          cpuPercent: 30,
          memoryPercent: 50,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Estado desconocido');
    });

    it('debe rechazar con 400 si cpuPercent o memoryPercent son menores a 0 o mayores a 100', async () => {
      const resOver = await request(app)
        .post(`/api/stations/${testStation.id}/reports`)
        .set(authHeader)
        .send({
          declaredStatus: 'OK',
          agentVersion: '1.0.0',
          ipAddress: '192.168.1.50',
          cpuPercent: 150,
          memoryPercent: 50,
        });

      expect(resOver.status).toBe(400);
      expect(resOver.body.error).toBe('Procentaje fuera de rango');

      const resUnder = await request(app)
        .post(`/api/stations/${testStation.id}/reports`)
        .set(authHeader)
        .send({
          declaredStatus: 'OK',
          agentVersion: '1.0.0',
          ipAddress: '192.168.1.50',
          cpuPercent: 50,
          memoryPercent: -10,
        });

      expect(resUnder.status).toBe(400);
      expect(resUnder.body.error).toBe('Procentaje fuera de rango');
    });
  });
});
