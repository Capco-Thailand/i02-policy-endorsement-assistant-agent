import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPolicy, signOut } from './api';

afterEach(() => vi.unstubAllGlobals());

describe('FR-01 API client', () => {
  it('sends bodyless sign-out without JSON Content-Type', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal('fetch', fetchMock);
    await signOut();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:3000/api/auth/sign-out');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect(new Headers(init.headers).has('content-type')).toBe(false);
  });
});

describe('FR-03 policy detail client', () => {
  it('keeps an unavailable policy distinct from a service failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    await expect(getPolicy('UNKNOWN')).rejects.toThrow('NOT_FOUND');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );
    await expect(getPolicy('POL-NARIN-001')).rejects.toThrow('API_UNAVAILABLE');
  });
});
