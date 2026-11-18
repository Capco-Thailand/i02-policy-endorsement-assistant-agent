import { expect, test, type Page } from '@playwright/test';

const api = 'http://localhost:3000';
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
    await testInfo.attach('Rendered application', {
      body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
      contentType: 'image/png',
    });
});
test('FR-04 AC2/AC6: owner sees cited evidence and 320px remains readable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await signIn(page);
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  const evidence = page.getByRole('region', {
    name: 'Synthetic policy evidence',
  });
  await expect(evidence.getByText('Matches policy facts.')).toBeVisible();
  await expect(
    evidence.getByText(
      /Document DOC-FAMILY-001 · Version 1.0.0 · Section dates/,
    ),
  ).toBeVisible();
  await expect(page.getByText('1 January 2025')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Start a change request' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test('FR-04 AC3/AC4: foreign evidence is hidden and expired owned policy keeps request disabled', async ({
  page,
  request,
}) => {
  expect(
    (await request.get(`${api}/api/policies/POL-NARIN-001/evidence`)).status(),
  ).toBe(401);
  await signIn(page);
  const foreign = await page.request.get(
    `${api}/api/policies/POL-MALI-001/evidence`,
  );
  const unknown = await page.request.get(
    `${api}/api/policies/UNKNOWN/evidence`,
  );
  expect(foreign.status()).toBe(404);
  expect(await foreign.json()).toEqual(await unknown.json());
  await page.getByRole('link', { name: /Classic Life Plan/ }).click();
  await expect(
    page
      .getByRole('region', { name: 'Synthetic policy evidence' })
      .getByText('Matches policy facts.'),
  ).toBeVisible();
  await expect(page.getByText(/Change requests are unavailable/)).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Start a change request' }),
  ).toHaveCount(0);
});
test('FR-04 AC4/AC6: unresolved evidence shows reason and retry', async ({
  page,
}) => {
  await page.route('**/api/policies/POL-NARIN-001/evidence*', async (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        evidence: {
          status: 'unresolved',
          reason: 'conflicting',
          citations: [],
        },
      }),
    }),
  );
  await signIn(page);
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await expect(
    page.getByRole('status').filter({ hasText: /Evidence unresolved/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Retry evidence' }),
  ).toBeVisible();
  await expect(page.getByText('1 January 2025')).toBeVisible();
});
test('FR-04 AC5/AC6: retrieval failure is unavailable and retry recovers', async ({
  page,
}) => {
  let fail = true;
  await page.route('**/api/policies/POL-NARIN-001/evidence*', async (route) => {
    if (fail) {
      fail = false;
      await route.fulfill({ status: 503, body: 'temporarily unavailable' });
    } else await route.continue();
  });
  await signIn(page);
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await expect(
    page.getByText('Policy evidence is temporarily unavailable.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('Matches policy facts.')).toBeVisible();
});
test('FR-04 AC6: session-ended evidence hides citations and offers sign-in', async ({
  page,
}) => {
  await page.route('**/api/policies/POL-NARIN-001/evidence*', async (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: '{"error":"UNAUTHORIZED"}',
    }),
  );
  await signIn(page);
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  const evidence = page.getByRole('region', {
    name: 'Synthetic policy evidence',
  });
  await expect(evidence.getByRole('alert')).toContainText(
    'Your session has ended',
  );
  await expect(
    evidence.getByRole('link', { name: 'Sign in again' }),
  ).toBeVisible();
  await expect(evidence.getByText(/Document DOC-/)).toHaveCount(0);
});
