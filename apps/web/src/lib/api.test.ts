import { describe, expect, it, vi } from 'vitest';
import { getPolicies } from './api';

describe('FR-01 AC4: validated policy API data', () => {
  it('rejects a malformed policy response before rendering protected data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          policies: [{ id: 'SYN-POL-1001', status: 'FORGED' }],
        }),
      }),
    );

    expect(await getPolicies('pea_session=opaque')).toEqual({
      kind: 'unavailable',
    });
    vi.unstubAllGlobals();
  });
});
