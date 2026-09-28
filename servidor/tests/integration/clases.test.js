import { describe, it, expect, beforeEach, afterAll } from 'vitest';
const request = require('supertest');
const app = require('../../src/app');
const { resetDb, disconnectDb, prisma } = require('../helpers/db');
const { createTestAdmin, generateToken } = require('../helpers/auth');
const { createClass, createStation } = require('../helpers/factories');

describe('Integration Tests — /api/classes', () => {
  let authHeader;

  beforeEach(async () => {
    await resetDb();
    const admin = await createTestAdmin();
    authHeader = admin.authHeader;
  });

  afterAll(async () => {
    await disconnectDb();
  });

  describe('8.2.5 — Autenticación y Autorización en Clases', () => {
    it('debe rechazar GET /api/classes con 401 si no se envía token', async () => {
      const res = await request(app).get('/api/classes');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('mensaje');
    });

    it('debe rechazar GET /api/classes con 403 si el token es inválido', async () => {
      const res = await request(app)
        .get('/api/classes')
        .set('Authorization', 'Bearer token_invalido_xyz');
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('mensaje');
    });
  });

  describe('8.2.5 — CRUD de Clases', () => {
    it('debe listar las clases existentes con conteo de estaciones', async () => {
      const cls = await createClass({ code: 'ISO-101', name: 'Clase Test' });
      await createStation(cls.id, { code: 'E-01' });

      const res = await request(app)
        .get('/api/classes')
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].code).toBe('ISO-101');
      expect(res.body[0]._count).toHaveProperty('stations', 1);
    });

    it('debe crear una nueva clase con código 201', async () => {
      const payload = {
        code: 'ISO-202',
        name: 'Algoritmos y Estructuras',
        section: 'Sec-02',
        location: 'Lab 204',
        schedule: 'Mar-Jue 10:00-12:00',
        active: true,
      };

      const res = await request(app)
        .post('/api/classes')
        .set(authHeader)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.code).toBe(payload.code);

      const inDb = await prisma.class.findUnique({ where: { code: payload.code } });
      expect(inDb).not.toBeNull();
    });

    it('debe rechazar la creación con 409 si el código de clase ya existe', async () => {
      await createClass({ code: 'ISO-DUPLICADO' });

      const res = await request(app)
        .post('/api/classes')
        .set(authHeader)
        .send({
          code: 'ISO-DUPLICADO',
          name: 'Otra Clase',
          section: 'Sec-01',
          location: 'Lab 1',
          schedule: 'Lun 08:00',
        });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error');
    });

    it('debe obtener el detalle de una clase existente por ID (código 201 de la app)', async () => {
      const cls = await createClass({ code: 'ISO-GET-ID', name: 'Clase Individual' });

      const res = await request(app)
        .get(`/api/classes/${cls.id}`)
        .set(authHeader);

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(cls.id);
      expect(res.body.code).toBe('ISO-GET-ID');
    });

    it('debe actualizar una clase existente con código 200', async () => {
      const cls = await createClass({ code: 'ISO-PUT', name: 'Nombre Viejo' });

      const res = await request(app)
        .put(`/api/classes/${cls.id}`)
        .set(authHeader)
        .send({
          code: 'ISO-PUT',
          name: 'Nombre Actualizado',
          section: 'Sec-99',
          location: 'Lab 500',
          schedule: 'Viernes 14:00-18:00',
          active: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Nombre Actualizado');
      expect(res.body.active).toBe(false);
    });

    it('debe eliminar una clase sin estaciones asociadas con código 204', async () => {
      const cls = await createClass({ code: 'ISO-DELETE-OK' });

      const res = await request(app)
        .delete(`/api/classes/${cls.id}`)
        .set(authHeader);

      expect(res.status).toBe(204);

      const inDb = await prisma.class.findUnique({ where: { id: cls.id } });
      expect(inDb).toBeNull();
    });

    it('debe rechazar con 409 la eliminación de una clase que aún tiene estaciones asociadas', async () => {
      const cls = await createClass({ code: 'ISO-CON-ESTACIONES' });
      await createStation(cls.id, { code: 'E-01' });

      const res = await request(app)
        .delete(`/api/classes/${cls.id}`)
        .set(authHeader);

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('estaciones asociadas');
    });
  });
});
