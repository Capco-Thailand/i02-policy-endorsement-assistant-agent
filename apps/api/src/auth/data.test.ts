import { describe, expect, it, vi } from 'vitest';
import { scryptSync } from 'node:crypto';
import { authenticate } from './data.js';

vi.mock('node:crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:crypto')>();
  return { ...actual, scryptSync: vi.fn(actual.scryptSync) };
});

describe('FR-01 credential verification', () => {
  it('performs password hashing for unknown and known account IDs', () => {
    const hash = vi.mocked(scryptSync);
    hash.mockClear();
    expect(authenticate('narin', 'wrong')).toBeUndefined();
    expect(hash).toHaveBeenCalledTimes(1);
    hash.mockClear();
    expect(authenticate('not-an-account', 'wrong')).toBeUndefined();
    expect(hash).toHaveBeenCalledTimes(1);
    expect(authenticate('not-an-account', 'NarinDemo123!')).toBeUndefined();
  });
});
