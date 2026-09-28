import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
const { calculateStatus } = require('../../src/controllers/estaciones');

describe('Unit Tests — calculateStatus (Lógica del Semáforo)', () => {
  const baseTime = new Date('2026-09-27T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseTime);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('8.1.1 — Sin Reportes', () => {
    it('debe retornar SIN_REPORTES y elapsedSeconds: null cuando lastReport es null', () => {
      const result = calculateStatus(null, false);
      expect(result).toEqual({
        calculatedStatus: 'SIN_REPORTES',
        elapsedSeconds: null,
      });
    });

    it('debe retornar SIN_REPORTES y elapsedSeconds: null cuando lastReport es undefined', () => {
      const result = calculateStatus(undefined, false);
      expect(result).toEqual({
        calculatedStatus: 'SIN_REPORTES',
        elapsedSeconds: null,
      });
    });
  });

  describe('8.1.2 — Estado OK (<= 25 segundos)', () => {
    it('debe retornar OK cuando el reporte fue emitido hace 0 segundos (inmediato)', () => {
      const lastReport = {
        createdAt: new Date(baseTime.getTime()),
        declaredStatus: 'OK',
      };
      const result = calculateStatus(lastReport, false);
      expect(result.calculatedStatus).toBe('OK');
      expect(result.elapsedSeconds).toBe(0);
    });

    it('debe retornar OK cuando el reporte fue emitido hace 15 segundos', () => {
      const lastReport = {
        createdAt: new Date(baseTime.getTime() - 15000),
        declaredStatus: 'OK',
      };
      const result = calculateStatus(lastReport, false);
      expect(result.calculatedStatus).toBe('OK');
      expect(result.elapsedSeconds).toBe(15);
    });

    it('debe retornar OK en el límite exacto de 25 segundos', () => {
      const lastReport = {
        createdAt: new Date(baseTime.getTime() - 25000),
        declaredStatus: 'OK',
      };
      const result = calculateStatus(lastReport, false);
      expect(result.calculatedStatus).toBe('OK');
      expect(result.elapsedSeconds).toBe(25);
    });
  });

  describe('8.1.3 — Estado ADVERTENCIA (> 25s y <= 40s)', () => {
    it('debe retornar ADVERTENCIA cuando el reporte fue emitido hace 26 segundos', () => {
      const lastReport = {
        createdAt: new Date(baseTime.getTime() - 26000),
        declaredStatus: 'OK',
      };
      const result = calculateStatus(lastReport, false);
      expect(result.calculatedStatus).toBe('ADVERTENCIA');
      expect(result.elapsedSeconds).toBe(26);
    });

    it('debe retornar ADVERTENCIA en el límite exacto de 40 segundos', () => {
      const lastReport = {
        createdAt: new Date(baseTime.getTime() - 40000),
        declaredStatus: 'OK',
      };
      const result = calculateStatus(lastReport, false);
      expect(result.calculatedStatus).toBe('ADVERTENCIA');
      expect(result.elapsedSeconds).toBe(40);
    });
  });

  describe('8.1.4 — Estado CRÍTICO por tiempo (> 40 segundos)', () => {
    it('debe retornar CRITICO cuando el reporte fue emitido hace 41 segundos', () => {
      const lastReport = {
        createdAt: new Date(baseTime.getTime() - 41000),
        declaredStatus: 'OK',
      };
      const result = calculateStatus(lastReport, false);
      expect(result.calculatedStatus).toBe('CRITICO');
      expect(result.elapsedSeconds).toBe(41);
    });

    it('debe retornar CRITICO cuando el reporte fue emitido hace varios minutos', () => {
      const lastReport = {
        createdAt: new Date(baseTime.getTime() - 120000),
        declaredStatus: 'OK',
      };
      const result = calculateStatus(lastReport, false);
      expect(result.calculatedStatus).toBe('CRITICO');
      expect(result.elapsedSeconds).toBe(120);
    });
  });

  describe('8.1.5 — Estado CRÍTICO por status declarado (INTERNET o IA)', () => {
    it('debe retornar CRITICO si declaredStatus es INTERNET incluso con reporte de 5 segundos', () => {
      const lastReport = {
        createdAt: new Date(baseTime.getTime() - 5000),
        declaredStatus: 'INTERNET',
      };
      const result = calculateStatus(lastReport, false);
      expect(result.calculatedStatus).toBe('CRITICO');
      expect(result.elapsedSeconds).toBe(5);
    });

    it('debe retornar CRITICO si declaredStatus es IA incluso con reporte reciente (0 segundos)', () => {
      const lastReport = {
        createdAt: new Date(baseTime.getTime()),
        declaredStatus: 'IA',
      };
      const result = calculateStatus(lastReport, false);
      expect(result.calculatedStatus).toBe('CRITICO');
      expect(result.elapsedSeconds).toBe(0);
    });
  });

  describe('8.1.6 — Estación Ignorada', () => {
    it('debe retornar IGNORADA cuando ignored es true sin importar tiempo ni declaredStatus OK', () => {
      const lastReport = {
        createdAt: new Date(baseTime.getTime() - 10000),
        declaredStatus: 'OK',
      };
      const result = calculateStatus(lastReport, true);
      expect(result.calculatedStatus).toBe('IGNORADA');
      expect(result.elapsedSeconds).toBeUndefined();
    });

    it('debe retornar IGNORADA cuando ignored es true y declaredStatus es INTERNET', () => {
      const lastReport = {
        createdAt: new Date(baseTime.getTime() - 5000),
        declaredStatus: 'INTERNET',
      };
      const result = calculateStatus(lastReport, true);
      expect(result.calculatedStatus).toBe('IGNORADA');
      expect(result.elapsedSeconds).toBeUndefined();
    });

    it('debe retornar IGNORADA cuando ignored es true y tiempo > 40s', () => {
      const lastReport = {
        createdAt: new Date(baseTime.getTime() - 60000),
        declaredStatus: 'OK',
      };
      const result = calculateStatus(lastReport, true);
      expect(result.calculatedStatus).toBe('IGNORADA');
      expect(result.elapsedSeconds).toBeUndefined();
    });
  });

  describe('8.1.7 — Validación de Rango de Porcentajes de Recursos (CPU y Memoria)', () => {
    const isValidPercentage = (val) =>
      typeof val === 'number' && !isNaN(val) && val >= 0 && val <= 100;

    it('debe validar porcentajes correctos entre 0 y 100', () => {
      expect(isValidPercentage(0)).toBe(true);
      expect(isValidPercentage(50)).toBe(true);
      expect(isValidPercentage(100)).toBe(true);
    });

    it('debe rechazar porcentajes fuera de rango o inválidos', () => {
      expect(isValidPercentage(-1)).toBe(false);
      expect(isValidPercentage(101)).toBe(false);
      expect(isValidPercentage(NaN)).toBe(false);
      expect(isValidPercentage('50')).toBe(false);
      expect(isValidPercentage(null)).toBe(false);
    });
  });
});
