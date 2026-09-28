import { describe, it, expect, beforeEach, afterAll } from 'vitest';
const request = require('supertest');
const app = require('../../src/app');
const { resetDb, disconnectDb, prisma } = require('../helpers/db');
const { createTestAdmin } = require('../helpers/auth');
const { createClass, createStation, createReport } = require('../helpers/factories');

describe('Integration Tests — /api/dashboard/summary', () => {
  let authHeader;
  let testClass;

  beforeEach(async () => {
    await resetDb();
    const admin = await createTestAdmin();
    authHeader = admin.authHeader;
    testClass = await createClass({ code: 'ISO-SUMMARY-CLASS' });
  });

  afterAll(async () => {
    await disconnectDb();
  });

  describe('8.2.8 — Resumen del Dashboard y Contadores Agregados', () => {
    it('debe rechazar con 401 si no se envía token de autenticación', async () => {
      const res = await request(app).get(`/api/dashboard/summary?classId=${testClass.id}`);
      expect(res.status).toBe(401);
    });

    it('debe rechazar con 400 si falta el parámetro classId', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set(authHeader);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Falta classId');
    });

    it('debe rechazar con 404 si la clase especificada no existe', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary?classId=99999')
        .set(authHeader);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('No existe una clase con ese ID');
    });

    it('debe calcular con precisión los contadores agregados (active, ok, warning, critical, ignored)', async () => {
      // 1. Estación OK (reporte reciente < 25s)
      const stOk = await createStation(testClass.id, { code: 'ST-OK' });
      await createReport(stOk.id, { declaredStatus: 'OK', createdAt: new Date() });

      // 2. Estación ADVERTENCIA (reporte hace 30s)
      const stWarn = await createStation(testClass.id, { code: 'ST-WARN' });
      await createReport(stWarn.id, {
        declaredStatus: 'OK',
        createdAt: new Date(Date.now() - 30000),
      });

      // 3. Estación CRITICO por tiempo (> 40s)
      const stCritTime = await createStation(testClass.id, { code: 'ST-CRIT-TIME' });
      await createReport(stCritTime.id, {
        declaredStatus: 'OK',
        createdAt: new Date(Date.now() - 60000),
      });

      // 4. Estación CRITICO por estado declarado (INTERNET)
      const stCritNet = await createStation(testClass.id, { code: 'ST-CRIT-NET' });
      await createReport(stCritNet.id, {
        declaredStatus: 'INTERNET',
        createdAt: new Date(),
      });

      // 5. Estación IGNORADA (ignored: true)
      const stIgnored = await createStation(testClass.id, {
        code: 'ST-IGNORED',
        ignored: true,
      });
      await createReport(stIgnored.id, { declaredStatus: 'OK', createdAt: new Date() });

      // 6. Estación SIN_REPORTES (sin reportes asociados)
      await createStation(testClass.id, { code: 'ST-NO-REPORTS' });

      // Ejecutar consulta de resumen
      const res = await request(app)
        .get(`/api/dashboard/summary?classId=${testClass.id}`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        classId: testClass.id,
        active: 5,     // 6 estaciones totales - 1 ignorada = 5 activas
        ok: 1,         // 1 OK
        warning: 1,    // 1 ADVERTENCIA
        critical: 2,   // 2 CRITICO (1 por tiempo + 1 por INTERNET)
        ignored: 1,    // 1 IGNORADA
      });
    });
  });
});
