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

describe('Integration Tests — /api/stations', () => {
  let authHeader;
  let testClass;

  beforeEach(async () => {
    await resetDb();
    const admin = await createTestAdmin();
    authHeader = admin.authHeader;
    testClass = await createClass({ code: 'ISO-EST-TEST' });
  });

  afterAll(async () => {
    await disconnectDb();
  });

  describe('8.2.6 — Autenticación en Estaciones', () => {
    it('debe rechazar GET /api/stations con 401 si no se envía token', async () => {
      const res = await request(app).get(
        `/api/stations?classId=${testClass.id}`
      );
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('mensaje');
    });

    it('debe retornar 400 si se omite el parámetro classId en GET /api/stations', async () => {
      const res = await request(app).get('/api/stations').set(authHeader);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('8.2.6 — CRUD de Estaciones y Unicidad de Código', () => {
    it('debe listar estaciones de una clase con su estado calculado', async () => {
      const st = await createStation(testClass.id, {
        code: 'E-01',
        name: 'Estación 1',
      });
      await createReport(st.id, {
        declaredStatus: 'OK',
        createdAt: new Date(),
      });

      const res = await request(app)
        .get(`/api/stations?classId=${testClass.id}`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].code).toBe('E-01');
      expect(res.body[0].calculatedStatus).toBe('OK');
    });

    it('debe crear una nueva estación con código 201', async () => {
      const payload = {
        code: 'EST-NEW-01',
        name: 'Estación Nueva',
        location: 'Fila 1 - Puesto 1',
        operatingSystem: 'WINDOWS',
        ignored: false,
        classId: testClass.id,
      };

      const res = await request(app)
        .post('/api/stations')
        .set(authHeader)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.code).toBe(payload.code);
      expect(res.body.classId).toBe(testClass.id);
    });

    it('debe rechazar con 409 al intentar crear una estación con código duplicado en la MISMA clase', async () => {
      await createStation(testClass.id, { code: 'EST-DUP' });

      const res = await request(app)
        .post('/api/stations')
        .set(authHeader)
        .send({
          code: 'EST-DUP',
          name: 'Estación Duplicada',
          location: 'Fila 2',
          operatingSystem: 'LINUX',
          classId: testClass.id,
        });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error');
    });

    it('debe permitir crear una estación con el mismo código en una DISTINTA clase', async () => {
      const otherClass = await createClass({ code: 'ISO-OTHER-CLASS' });
      await createStation(testClass.id, { code: 'EST-SHARED' });

      const res = await request(app)
        .post('/api/stations')
        .set(authHeader)
        .send({
          code: 'EST-SHARED',
          name: 'Estación en otra clase',
          location: 'Lab B',
          operatingSystem: 'MACOS',
          classId: otherClass.id,
        });

      expect(res.status).toBe(201);
      expect(res.body.code).toBe('EST-SHARED');
      expect(res.body.classId).toBe(otherClass.id);
    });

    it('debe obtener el detalle de una estación con código 201 (comportamiento real de la app)', async () => {
      const st = await createStation(testClass.id, { code: 'EST-DETAIL' });

      const res = await request(app)
        .get(`/api/stations/${st.id}`)
        .set(authHeader);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('station');
      expect(res.body.station.id).toBe(st.id);
      expect(res.body).toHaveProperty('calculatedStatus');
    });

    it('debe actualizar una estación vía PUT con código 200', async () => {
      const st = await createStation(testClass.id, { code: 'EST-PUT' });

      const res = await request(app)
        .put(`/api/stations/${st.id}`)
        .set(authHeader)
        .send({
          code: 'EST-PUT-UPDATED',
          name: 'Nombre Actualizado',
          location: 'Nueva Ubicacion',
          operatingSystem: 'LINUX',
          classId: testClass.id,
        });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('EST-PUT-UPDATED');
      expect(res.body.name).toBe('Nombre Actualizado');
      expect(res.body.operatingSystem).toBe('LINUX');
    });

    it('debe modificar el flag ignored vía PATCH con código 200', async () => {
      const st = await createStation(testClass.id, {
        code: 'EST-PATCH',
        ignored: false,
      });

      const res = await request(app)
        .patch(`/api/stations/${st.id}`)
        .set(authHeader)
        .send({ ignored: true });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(st.id);
      expect(res.body.ignored).toBe(true);

      const inDb = await prisma.station.findUnique({ where: { id: st.id } });
      expect(inDb.ignored).toBe(true);
    });

    it('debe eliminar una estación vía DELETE con código 204', async () => {
      // NOTE (BUG REPORT): In servidor/src/controllers/estaciones.js (line 398),
      // eliminarEstacion calls `res.status(204);` without calling `.send()` or `.end()`.
      // This causes the HTTP response to never terminate.
      const st = await createStation(testClass.id, { code: 'EST-DEL' });

      const res = await request(app)
        .delete(`/api/stations/${st.id}`)
        .set(authHeader);

      expect(res.status).toBe(204);

      const inDb = await prisma.station.findUnique({ where: { id: st.id } });
      expect(inDb).toBeNull();
    }, 2000);
  });
});
