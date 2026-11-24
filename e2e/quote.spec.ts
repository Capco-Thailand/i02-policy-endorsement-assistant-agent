import { expect, test } from '@playwright/test';

const api = `http://localhost:${process.env.E2E_API_PORT ?? 3000}`;
const root = `${api}/api/policies/POL-NARIN-001/requests`;

test('FR-09 quote: owner receives exact synthetic payment comparison and unchanged address impact', async ({
  request,
}) => {
  const signIn = await request.post(`${api}/api/auth/sign-in`, {
    data: { accountId: 'narin', password: 'NarinDemo123!' },
  });
  expect(signIn.status()).toBe(200);
  const create = async (data: Record<string, unknown>) => {
    const response = await request.post(root, { data });
    expect(response.status()).toBe(200);
    return (await response.json()).request.id as string;
  };
  const payment = await create({
    changeType: 'PAYMENT_FREQUENCY',
    requestedEffectiveDate: '2027-01-01',
    paymentFrequency: 'ANNUAL',
  });
  const quoted = await request.post(`${root}/${payment}/quote`);
  expect(quoted.status()).toBe(200);
  expect(await quoted.json()).toMatchObject({
    status: 'CALCULATED',
    quote: {
      ratingVersion: 'synthetic-rating-v1',
      currency: 'THB',
      before: {
        premiumPerInstallmentSatang: 121_500,
        annualizedScheduledTotalSatang: 1_458_000,
      },
      after: {
        premiumPerInstallmentSatang: 1_350_000,
        annualizedScheduledTotalSatang: 1_350_000,
      },
      difference: { annualizedScheduledTotalSatang: -108_000 },
    },
  });
  const address = await create({
    changeType: 'ADDRESS',
    requestedEffectiveDate: '2027-01-01',
    correspondenceAddress: '100 Synthetic Road',
  });
  const unchanged = await request.post(`${root}/${address}/quote`);
  expect(unchanged.status()).toBe(200);
  expect(await unchanged.json()).toEqual({
    status: 'UNCHANGED',
    premiumImpact: 'UNCHANGED',
    benefitImpact: 'UNCHANGED',
  });
  const rider = await create({
    changeType: 'ACCIDENTAL_DEATH_RIDER',
    requestedEffectiveDate: '2027-01-01',
    riderAction: 'ADD',
  });
  const referred = await request.post(`${root}/${rider}/quote`);
  expect(referred.status()).toBe(409);
  expect((await referred.json()).error).toBe('NOT_ELIGIBLE');
});

test('FR-09 quote: signed-out and foreign owner cannot get a quote', async ({
  request,
}) => {
  await request.post(`${api}/api/auth/sign-in`, {
    data: { accountId: 'narin', password: 'NarinDemo123!' },
  });
  const created = await request.post(root, {
    data: {
      changeType: 'PAYMENT_FREQUENCY',
      requestedEffectiveDate: '2027-01-01',
      paymentFrequency: 'ANNUAL',
    },
  });
  expect(created.status()).toBe(200);
  const requestId = (await created.json()).request.id as string;
  const route = `${root}/${requestId}/quote`;
  expect((await request.post(route)).status()).toBe(200);
  expect((await request.post(`${api}/api/auth/sign-out`)).status()).toBe(204);
  expect((await request.post(route)).status()).toBe(401);
  await request.post(`${api}/api/auth/sign-in`, {
    data: { accountId: 'mali', password: 'MaliDemo123!' },
  });
  expect((await request.post(route)).status()).toBe(404);
});
