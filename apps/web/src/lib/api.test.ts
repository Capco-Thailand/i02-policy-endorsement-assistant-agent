import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPolicy, getRules, signOut, uploadDocument } from './api';

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

describe('FR-07 upload client', () => {
  it('requests FR-05 rules for the recorded change and effective date', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'MISSING', citations: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await getRules('POL-NARIN-001', 'ADDRESS', '2027-01-01');
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://localhost:3000/api/policies/POL-NARIN-001/rules?changeType=ADDRESS&requestedEffectiveDate=2027-01-01',
    );
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
  });
  it('sends the request ID before the synthetic file as multipart without a JSON header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'RECEIVED_MOCK',
        explanation: 'Mock receipt only.',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const file = new File(['%PDF-fixture'], 'fixture.pdf', {
      type: 'application/pdf',
    });
    await uploadDocument('POL-NARIN-001', 'request-id', file);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      'http://localhost:3000/api/policies/POL-NARIN-001/document-upload',
    );
    expect(init.credentials).toBe('include');
    expect(new Headers(init.headers).has('content-type')).toBe(false);
    expect([...init.body.entries()]).toEqual([
      ['requestId', 'request-id'],
      ['document', file],
    ]);
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
