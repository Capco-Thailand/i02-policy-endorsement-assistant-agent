import { describe, expect, it } from 'vitest';
import { buildApp } from './app.js';

describe('PostgreSQL startup', () => {
  it('rejects missing database configuration', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      await expect(buildApp()).rejects.toThrow('DATABASE_URL');
    } finally {
      if (previous !== undefined) process.env.DATABASE_URL = previous;
    }
  });
  it('rejects an unavailable database without exposing its URL', async () => {
    const previous = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://localhost:1/pea_unavailable';
    try {
      await expect(buildApp()).rejects.toThrow('Database connection failed');
    } finally {
      if (previous === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previous;
    }
  });
});
