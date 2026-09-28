import { describe, it, expect, beforeEach, afterAll } from 'vitest';
const request = require('supertest');
const app = require('../../src/app');
const { resetDb, disconnectDb, prisma } = require('../helpers/db');
const { createTestAdmin } = require('../helpers/auth');
const {
  createClass,
  createStation,
  createReport,
} = require('../helpers/factories');

describe('Integration Tests — Persistence & Cascading (Persistencia y Transaccionalidad)', () => {
  let authHeader;

  beforeEach(async () => {
    await resetDb();
    const admin = await createTestAdmin();
    authHeader = admin.authHeader;
  });

  afterAll(async () => {
    await disconnectDb();
  });

  describe('8.2.9 — Persistencia y Borrado en Cascada', () => {
    it('debe persistir los cambios a través de múltiples llamadas independientes a la API', async () => {
      // 1. Crear clase vía API
      const classRes = await request(app)
        .post('/api/classes')
        .set(authHeader)
        .send({
          code: 'ISO-PERSIST-1',
          name: 'Clase Persistencia',
          section: 'Sec-01',
          location: 'Lab 101',
          schedule: 'Lun 08:00',
        });
      expect(classRes.status).toBe(201);
      const classId = classRes.body.id;

      // 2. Crear estación vía API
      const stationRes = await request(app)
        .post('/api/stations')
        .set(authHeader)
        .send({
          code: 'EST-P01',
          name: 'Estación Persistente',
          location: 'Mesa 1',
          operatingSystem: 'LINUX',
          classId: classId,
        });
      expect(stationRes.status).toBe(201);
      const stationId = stationRes.body.id;

      // 3. Crear múltiples reportes vía API
      const rep1 = await request(app)
        .post(`/api/stations/${stationId}/reports`)
        .set(authHeader)
        .send({
          declaredStatus: 'OK',
          agentVersion: '1.0.0',
          ipAddress: '192.168.1.10',
          cpuPercent: 20,
          memoryPercent: 30,
        });
      expect(rep1.status).toBe(201);

      const rep2 = await request(app)
        .post(`/api/stations/${stationId}/reports`)
        .set(authHeader)
        .send({
          declaredStatus: 'OK',
          agentVersion: '1.0.0',
          ipAddress: '192.168.1.10',
          cpuPercent: 25,
          memoryPercent: 35,
        });
      expect(rep2.status).toBe(201);

      // 4. Consultar en llamada independiente y verificar persistencia
      const getStationRes = await request(app)
        .get(`/api/stations/${stationId}`)
        .set(authHeader);

      expect(getStationRes.status).toBe(201);
      expect(getStationRes.body.station.name).toBe('Estación Persistente');
      expect(getStationRes.body.reports.length).toBe(2);
    });

    it('debe eliminar en cascada todos los reportes cuando una estación es eliminada', async () => {
      // NOTE (BUG REPORT): In servidor/src/controllers/estaciones.js (line 398),
      // eliminarEstacion calls `res.status(204);` without calling `.send()` or `.end()`.
      // This causes the HTTP response to never terminate.
      const cls = await createClass({ code: 'ISO-CASCADE' });
      const st = await createStation(cls.id, { code: 'EST-CASCADE' });

      // Insertar 3 reportes asociados a la estación
      await createReport(st.id, { declaredStatus: 'OK' });
      await createReport(st.id, { declaredStatus: 'INTERNET' });
      await createReport(st.id, { declaredStatus: 'OK' });

      // Comprobar que existen 3 reportes en BD
      const initialReports = await prisma.report.findMany({
        where: { stationId: st.id },
      });
      expect(initialReports.length).toBe(3);

      // Eliminar la estación vía DELETE /api/stations/:id
      const delRes = await request(app)
        .delete(`/api/stations/${st.id}`)
        .set(authHeader);

      expect(delRes.status).toBe(204);

      // Verificar que la estación ya no existe
      const stInDb = await prisma.station.findUnique({
        where: { id: st.id },
      });
      expect(stInDb).toBeNull();

      // Verificar que los reportes fueron eliminados en cascada
      const remainingReports = await prisma.report.findMany({
        where: { stationId: st.id },
      });
      expect(remainingReports.length).toBe(0);
    }, 2000);
  });
});
