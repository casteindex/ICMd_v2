import { describe, it, expect, beforeEach, afterAll } from 'vitest';
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const { prisma, resetDb, disconnectDb } = require('../helpers/db');

describe('Integration Tests — /api/auth', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  describe('8.2.1 — Registro de usuario único', () => {
    it('debe registrar exitosamente al primer administrador y almacenar el password hasheado', async () => {
      const payload = {
        name: 'Admin Test',
        email: 'admin@unitec.edu',
        password: 'Password123!',
      };

      const res = await request(app).post('/api/auth/register').send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(payload.email);
      expect(res.body.name).toBe(payload.name);
      expect(res.body).not.toHaveProperty('passwordHash');

      // Verificar en base de datos
      const userInDb = await prisma.user.findUnique({
        where: { email: payload.email },
      });
      expect(userInDb).not.toBeNull();
      expect(userInDb.passwordHash).not.toBe(payload.password);
      const isMatch = await bcrypt.compare(
        payload.password,
        userInDb.passwordHash
      );
      expect(isMatch).toBe(true);
    });

    it('debe rechazar el registro con código 400 si faltan datos requeridos', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incompleto@unitec.edu' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('mensaje');
    });
  });

  describe('8.2.2 — Rechazo de registro duplicado / política single-admin', () => {
    it('debe rechazar el registro con 403 cuando ya existe un administrador registrado', async () => {
      // Registrar el primer usuario
      await request(app).post('/api/auth/register').send({
        name: 'Primer Admin',
        email: 'admin1@unitec.edu',
        password: 'Password123!',
      });

      // Intentar registrar un segundo usuario
      const res = await request(app).post('/api/auth/register').send({
        name: 'Segundo Admin',
        email: 'admin2@unitec.edu',
        password: 'Password123!',
      });

      expect(res.status).toBe(403);
      expect(res.body.mensaje).toBe(
        'El sistema ya tiene un administrador registrado'
      );
    });
  });

  describe('8.2.3 — Inicio de sesión (Login exitoso)', () => {
    it('debe iniciar sesión exitosamente y retornar token JWT válido', async () => {
      const password = 'Password123!';
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@unitec.edu',
          passwordHash: passwordHash,
        },
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@unitec.edu',
        password: password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('expiresIn');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('admin@unitec.edu');
    });
  });

  describe('8.2.4 — Rechazo de credenciales incorrectas', () => {
    it('debe retornar 401 si la contraseña es incorrecta', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword!', 10);
      await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@unitec.edu',
          passwordHash: passwordHash,
        },
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@unitec.edu',
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('mensaje');
    });

    it('debe retornar 401 si el usuario no existe', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'noexiste@unitec.edu',
        password: 'Password123!',
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('mensaje');
    });

    it('debe retornar 400 si faltan campos en el login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@unitec.edu' });

      expect(res.status).toBe(400);
    });
  });
});
