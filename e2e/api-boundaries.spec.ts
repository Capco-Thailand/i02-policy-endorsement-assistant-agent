import { expect, test } from '@playwright/test';

const api = `http://localhost:${process.env.E2E_API_PORT ?? 3000}`;
const validAddress = {
  changeType: 'ADDRESS',
  requestedEffectiveDate: '2027-01-01',
  correspondenceAddress: '100 Demo Road',
};

test('FR-16 owner-authorized list excludes foreign policies', async ({
  request,
}) => {
  await request.post(`${api}/api/auth/sign-in`, {
    data: { accountId: 'narin', password: 'NarinDemo123!' },
  });
  const response = await request.get(`${api}/api/policies`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.policies).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: 'POL-NARIN-001', status: 'ACTIVE' }),
      expect.objectContaining({ id: 'POL-NARIN-002', status: 'EXPIRED' }),
    ]),
  );
  expect(
    body.policies.some(
      (policy: { id: string }) => policy.id === 'POL-MALI-001',
    ),
  ).toBe(false);
  const unknown = await request.get(`${api}/api/policies/POL-UNKNOWN`);
  const foreign = await request.get(`${api}/api/policies/POL-MALI-001`);
  expect(foreign.status()).toBe(404);
  expect(await foreign.json()).toEqual(await unknown.json());
});

test('FR-08 eligibility rejects missing session and gives identical 404 for unknown and foreign policy', async ({
  request,
}) => {
  const route = (policyId: string, requestId: string) =>
    `${api}/api/policies/${policyId}/requests/${requestId}/eligibility`;
  expect((await request.post(route('POL-NARIN-001', 'unknown'))).status()).toBe(
    401,
  );
  await request.post(`${api}/api/auth/sign-in`, {
    data: { accountId: 'narin', password: 'NarinDemo123!' },
  });
  const unknown = await request.post(route('POL-UNKNOWN', 'unknown'));
  const foreign = await request.post(route('POL-MALI-001', 'unknown'));
  expect(unknown.status()).toBe(404);
  expect(foreign.status()).toBe(404);
  expect(await foreign.json()).toEqual(await unknown.json());
});

test('FR-01 AC2-AC3: protected routes reject missing and signed-out sessions', async ({
  request,
}) => {
  const unauthenticated = await request.get(`${api}/api/policies`);
  expect(unauthenticated.status()).toBe(401);
  const signedIn = await request.post(`${api}/api/auth/sign-in`, {
    data: { accountId: 'narin', password: 'NarinDemo123!' },
  });
  expect(signedIn.status()).toBe(200);
  expect((await signedIn.json()).actor.accountId).toBe('narin');
  expect((await request.get(`${api}/api/policies`)).status()).toBe(200);
  expect((await request.post(`${api}/api/auth/sign-out`)).status()).toBe(204);
  expect((await request.get(`${api}/api/policies`)).status()).toBe(401);
});

test('FR-01 AC4 / FR-03 AC4: forged identity cannot read another customer policy', async ({
  request,
}) => {
  await request.post(`${api}/api/auth/sign-in`, {
    data: { accountId: 'narin', password: 'NarinDemo123!' },
  });
  const unknown = await request.get(`${api}/api/policies/POL-UNKNOWN`);
  const foreign = await request.get(
    `${api}/api/policies/POL-MALI-001?customerId=CUS-002&role=admin`,
  );
  expect(unknown.status()).toBe(404);
  expect(foreign.status()).toBe(404);
  expect(await foreign.json()).toEqual(await unknown.json());
});

test('FR-02 AC3-AC5: invalid, foreign, expired and unauthenticated requests are rejected', async ({
  request,
}) => {
  expect(
    (
      await request.post(`${api}/api/policies/POL-NARIN-001/requests`, {
        data: validAddress,
      })
    ).status(),
  ).toBe(401);
  await request.post(`${api}/api/auth/sign-in`, {
    data: { accountId: 'narin', password: 'NarinDemo123!' },
  });
  const invalid = await request.post(
    `${api}/api/policies/POL-NARIN-001/requests`,
    {
      data: { ...validAddress, requestedEffectiveDate: '2027-02-30' },
    },
  );
  expect(invalid.status()).toBe(400);
  const spoofed = await request.post(
    `${api}/api/policies/POL-NARIN-001/requests`,
    {
      data: { ...validAddress, requesterId: 'CUS-002' },
    },
  );
  expect(spoofed.status()).toBe(400);
  const unknown = await request.post(
    `${api}/api/policies/POL-UNKNOWN/requests`,
    { data: validAddress },
  );
  const foreign = await request.post(
    `${api}/api/policies/POL-MALI-001/requests`,
    { data: validAddress },
  );
  expect(foreign.status()).toBe(404);
  expect(await foreign.json()).toEqual(await unknown.json());
  expect(
    (
      await request.post(`${api}/api/policies/POL-NARIN-002/requests`, {
        data: validAddress,
      })
    ).status(),
  ).toBe(409);
});

test('FR-02 AC2-AC6: a valid request records the session actor without changing policy facts', async ({
  request,
}) => {
  await request.post(`${api}/api/auth/sign-in`, {
    data: { accountId: 'narin', password: 'NarinDemo123!' },
  });
  const before = await (
    await request.get(`${api}/api/policies/POL-NARIN-001`)
  ).json();
  const created = await request.post(
    `${api}/api/policies/POL-NARIN-001/requests`,
    { data: validAddress },
  );
  expect(created.status()).toBe(200);
  const { request: record } = await created.json();
  expect(record).toMatchObject({
    requesterId: 'CUS-001',
    policyId: 'POL-NARIN-001',
    changeType: 'ADDRESS',
    correspondenceAddress: '100 Demo Road',
  });
  expect(record.id).toMatch(/^[0-9a-f-]{36}$/);
  expect(record.createdAt).toBeTruthy();
  expect(
    await (await request.get(`${api}/api/policies/POL-NARIN-001`)).json(),
  ).toEqual(before);
});
