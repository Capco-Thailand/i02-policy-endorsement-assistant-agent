import { expect, test, type Page } from '@playwright/test';

const api = `http://localhost:${process.env.E2E_API_PORT ?? 3000}`;
async function signIn(
  page: Page,
  accountId = 'narin',
  password = 'NarinDemo123!',
) {
  await page.goto('/');
  await page.getByLabel('Account ID').fill(accountId);
  await page.getByLabel('Password').fill(password);
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
    await testInfo.attach('FR-14 rendered application', {
      body: await page.screenshot({
        fullPage: true,
        animations: 'disabled',
        style: 'nextjs-portal { display: none !important; }',
      }),
      contentType: 'image/png',
    });
});

test('FR-14 accepted terms: Family Protection shows cited active coverage at 320px without changing policy', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await signIn(page);
  const before = await (
    await page.request.get(`${api}/api/policies/POL-NARIN-001`)
  ).json();
  await page.goto('/policies/POL-NARIN-001');
  await expect(
    page.getByRole('heading', { name: 'Product and plan' }),
  ).toBeVisible();
  await expect(page.getByText('Example Mutual (Synthetic)')).toBeVisible();
  await expect(page.getByText('Life', { exact: true })).toBeVisible();
  await expect(page.getByText('v1', { exact: true })).toBeVisible();
  await expect(page.getByText('THB 1,000,000')).toBeVisible();
  await expect(page.getByText('THB 250,000')).toBeVisible();
  for (const section of [
    'product',
    'coverage.life',
    'coverage.accidental-death',
    'exclusions.life',
    'exclusions.accidental-death',
  ])
    await expect(
      page.getByText(
        `Source: Family Protection Plan synthetic policy, version v1, section ${section}`,
      ),
    ).toBeVisible();
  await expect(
    page.getByText(
      'The life benefit does not cover death caused by intentional self-injury.',
    ),
  ).toBeVisible();
  await expect(
    page.getByText(
      'The accidental death benefit does not cover death caused solely by illness, without an accident.',
    ),
  ).toBeVisible();
  await expect(page.getByText('Arisa K.')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Start a change request' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await testInfo.attach('FR-14 active detail at 320px', {
    body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
    contentType: 'image/png',
  });
  const after = await (
    await page.request.get(`${api}/api/policies/POL-NARIN-001`)
  ).json();
  expect(after).toEqual(before);
});

test('FR-14 accepted terms: Secure Future has life coverage and no accidental death benefit', async ({
  page,
}) => {
  await signIn(page, 'mali', 'MaliDemo123!');
  await page.goto('/policies/POL-MALI-001');
  await expect(page.getByText('THB 750,000')).toBeVisible();
  await expect(
    page.getByText(
      'Source: Secure Future Plan synthetic policy, version v1, section coverage.life',
    ),
  ).toBeVisible();
  await expect(page.getByText(/accidental death benefit/i)).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Start a change request' }),
  ).toBeVisible();
});

test('FR-14 accepted terms: expired Classic Life shows historical amount without request action', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/policies/POL-NARIN-002');
  await expect(page.getByText('THB 500,000')).toBeVisible();
  await expect(
    page.getByText(
      'Source: Classic Life Plan synthetic policy, version v1, section coverage.life',
    ),
  ).toBeVisible();
  await expect(page.getByText('EXPIRED', { exact: true })).toBeVisible();
  await expect(
    page.getByText('This policy is expired. Change requests are unavailable.'),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Start a change request' }),
  ).toHaveCount(0);
  await expect(page.getByText(/accidental death benefit/i)).toHaveCount(0);
});

test('FR-14 owner boundary: missing session is unauthorized and foreign and unknown details are identical', async ({
  page,
}) => {
  expect(
    (await page.request.get(`${api}/api/policies/POL-NARIN-001`)).status(),
  ).toBe(401);
  await signIn(page, 'mali', 'MaliDemo123!');
  const foreign = await page.request.get(`${api}/api/policies/POL-NARIN-001`);
  const unknown = await page.request.get(`${api}/api/policies/POL-UNKNOWN`);
  expect(foreign.status()).toBe(404);
  expect(await foreign.json()).toEqual(await unknown.json());
  await page.goto('/policies/POL-NARIN-001');
  await expect(
    page.getByRole('heading', { name: 'This policy is unavailable.' }),
  ).toBeVisible();
  await expect(page.getByText('Example Mutual (Synthetic)')).toHaveCount(0);
  await expect(page.getByText(/Source: .*section/)).toHaveCount(0);
});

for (const reason of [
  'MISSING_SECTION',
  'STALE_ENCODER',
  'CONFLICTING_EVIDENCE',
] as const)
  test(`FR-14 unresolved ${reason}: affected amount hides while unrelated cited terms remain`, async ({
    page,
  }) => {
    await signIn(page);
    await page.route('**/api/policies/POL-NARIN-001', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      const life = body.policy.terms.coverages.find(
        (item: { id: string }) => item.id === 'coverage.life',
      );
      life.status = 'unresolved';
      life.reason = reason;
      delete life.value;
      await route.fulfill({ response, json: body });
    });
    await page.goto('/policies/POL-NARIN-001');
    await expect(
      page.getByText(/Unresolved: We can't confirm this coverage detail/),
    ).toBeVisible();
    await expect(page.getByText('THB 1,000,000')).toHaveCount(0);
    await expect(page.getByText('THB 250,000')).toBeVisible();
    await expect(page.getByText('Example Mutual (Synthetic)')).toBeVisible();
  });
