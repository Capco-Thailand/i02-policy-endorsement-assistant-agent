import { expect, test, type Page } from '@playwright/test';
const api = `http://localhost:${process.env.E2E_API_PORT ?? 3000}`;

async function signIn(page: Page) {
  await page.goto('/');
  await page.getByLabel('Account ID').fill('narin');
  await page.getByLabel('Password').fill('NarinDemo123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your policies' }),
  ).toBeVisible();
  await expect
    .poll(async () =>
      (await page.request.get(`${api}/api/auth/session`)).status(),
    )
    .toBe(200);
}

test.afterEach(async ({ page }, testInfo) => {
  if (!page.isClosed())
    await testInfo.attach('FR-04 rendered page', {
      body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
      contentType: 'image/png',
    });
});

test('FR-04 owned policy shows a bounded citation at 320px; foreign policy stays unavailable', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await signIn(page);
  await page.goto('/policies/POL-NARIN-001');
  await expect(
    page.getByRole('heading', { name: 'Synthetic policy evidence' }),
  ).toBeVisible();
  await expect(page.getByText('Matches policy facts')).toBeVisible();
  await expect(
    page.getByText('Family Protection Plan synthetic policy'),
  ).toBeVisible();
  await expect(page.getByText(/Version v1 · Section dates/)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await testInfo.attach('FR-04 available evidence at 320px', {
    body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
    contentType: 'image/png',
  });
  const foreign = await page.request.get(
    `${api}/api/policies/POL-MALI-001/evidence?query=When%20does%20protection%20begin`,
  );
  const unknown = await page.request.get(
    `${api}/api/policies/POL-UNKNOWN/evidence?query=When%20does%20protection%20begin`,
  );
  expect(foreign.status()).toBe(404);
  expect(await foreign.json()).toEqual(await unknown.json());
  await page.goto('/policies/POL-MALI-001');
  await expect(
    page.getByRole('heading', { name: 'This policy is unavailable.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Synthetic policy evidence' }),
  ).toHaveCount(0);
});

test('FR-04 unresolved evidence and service failure keep facts visible and retry', async ({
  page,
}) => {
  await signIn(page);
  let releaseEvidence: () => void = () => {};
  const pendingEvidence = new Promise<void>((resolve) => {
    releaseEvidence = resolve;
  });
  await page.route(
    '**/api/policies/POL-NARIN-001/evidence?*',
    async (route) => {
      await pendingEvidence;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'unresolved',
          reason: 'CONFLICTING_EVIDENCE',
          citations: [],
        }),
      });
    },
  );
  await page.goto('/policies/POL-NARIN-001');
  await expect(page.getByText('Loading policy evidence…')).toBeVisible();
  releaseEvidence();
  await expect(
    page.getByText(/evidence conflicts with policy facts/),
  ).toBeVisible();
  await expect(page.getByText('1 January 2025')).toBeVisible();
  await page.unroute('**/api/policies/POL-NARIN-001/evidence?*');
  let attempts = 0;
  await page.route(
    '**/api/policies/POL-NARIN-001/evidence?*',
    async (route) => {
      attempts++;
      if (attempts === 1)
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: '{"error":"EVIDENCE_UNAVAILABLE"}',
        });
      else await route.continue();
    },
  );
  await page.reload();
  await expect(
    page.getByText('Policy evidence is temporarily unavailable'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Retry evidence' }).click();
  await expect(page.getByText('Matches policy facts')).toBeVisible();
  expect(attempts).toBe(2);
});

test('FR-04 expired policy can read evidence but cannot request; session failure clears the view', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/policies/POL-NARIN-002');
  await expect(page.getByText('Matches policy facts')).toBeVisible();
  await expect(
    page.getByText('This policy is expired. Change requests are unavailable.'),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Start a change request' }),
  ).toHaveCount(0);
  await page.route(
    '**/api/policies/POL-NARIN-001/evidence?*',
    async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: '{"error":"UNAUTHORIZED"}',
      });
    },
  );
  await page.goto('/policies/POL-NARIN-001');
  await expect(page).toHaveURL(/\/\?ended=1$/);
  await expect(
    page.getByText('Family Protection Plan synthetic policy'),
  ).toHaveCount(0);
});
