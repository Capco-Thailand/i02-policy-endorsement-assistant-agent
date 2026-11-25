import { expect, test, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

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
}

test('FR-12 owner sees a recorded approval, original detail, and unchanged policy', async ({
  page,
}, info) => {
  await signIn(page);
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  const before = await page
    .getByText('Monthly', { exact: true })
    .first()
    .textContent();
  await page.getByRole('link', { name: 'Start a change request' }).click();
  await page.getByLabel('Change type').selectOption('ADDRESS');
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  await page
    .getByLabel('Correspondence address', { exact: true })
    .last()
    .fill('100 Synthetic Road');
  await page.getByRole('button', { name: 'Record request' }).click();
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await page
    .getByRole('button', { name: 'Prepare proposal for review' })
    .click();
  await page.getByRole('button', { name: 'Approve proposal' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your decision was recorded' }),
  ).toBeVisible();
  const firstProposalPath = new URL(page.url()).pathname;
  await page.goto('/policies');
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await page.getByRole('link', { name: 'Start a change request' }).click();
  await page.getByLabel('Change type').selectOption('ADDRESS');
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  await page
    .getByLabel('Correspondence address', { exact: true })
    .last()
    .fill('200 Synthetic Road');
  await page.getByRole('button', { name: 'Record request' }).click();
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await page
    .getByRole('button', { name: 'Prepare proposal for review' })
    .click();
  await page.getByRole('button', { name: 'Approve proposal' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your decision was recorded' }),
  ).toBeVisible();
  const newestProposalPath = new URL(page.url()).pathname;
  await page.goto('/policies');
  await page.getByRole('link', { name: 'Customer change history' }).click();
  await expect(
    page.getByRole('heading', { name: 'Customer change history' }),
  ).toBeVisible();
  await expect(page.getByText('APPROVED').first()).toBeVisible();
  const links = page.getByRole('link', { name: /View recorded proposal/ });
  await expect(links.nth(0)).toHaveAttribute('href', newestProposalPath);
  await expect(links.nth(1)).toHaveAttribute('href', firstProposalPath);
  await expect(
    page
      .getByRole('heading', {
        name: /Correspondence address: 200 Synthetic Road/,
      })
      .first(),
  ).toBeVisible();
  await expect(
    page
      .getByRole('heading', {
        name: /Correspondence address: 100 Synthetic Road/,
      })
      .first(),
  ).toBeVisible();
  await info.attach('Desktop history', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  await page
    .getByRole('link', { name: /View recorded proposal/ })
    .first()
    .click();
  await expect(page).toHaveURL(newestProposalPath);
  await expect(
    page.getByText(/underlying policy and coverage stay unchanged/),
  ).toBeVisible();
  await page.goto('/policies/POL-NARIN-001');
  expect(
    await page.getByText('Monthly', { exact: true }).first().textContent(),
  ).toBe(before);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await signIn(page, 'mali', 'MaliDemo123!');
  const apiBase = `http://localhost:${process.env.E2E_API_PORT ?? 3000}`;
  const apiSignIn = await page.request.post(`${apiBase}/api/auth/sign-in`, {
    data: { accountId: 'mali', password: 'MaliDemo123!' },
  });
  expect(apiSignIn.status()).toBe(200);
  const cookie = apiSignIn.headers()['set-cookie'];
  const foreignHistory = await page.request.get(`${apiBase}/api/history`, {
    headers: { cookie },
  });
  expect(foreignHistory.status()).toBe(200);
  expect(JSON.stringify(await foreignHistory.json())).not.toContain(
    newestProposalPath.split('/').at(-1),
  );
  const foreignDetail = await page.request.get(
    `${apiBase}/api${newestProposalPath}`,
    { headers: { cookie } },
  );
  expect(foreignDetail.status()).toBe(404);
});

test('FR-12 failed history read shows retry, not empty success', async ({
  page,
}, info) => {
  await signIn(page);
  await page.route('**/api/history', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'HISTORY_UNAVAILABLE' }),
    }),
  );
  await page.getByRole('link', { name: 'Customer change history' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'could not load' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(page.getByText(/approved changes will appear here/)).toHaveCount(
    0,
  );
  await info.attach('History failure', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
});

test('FR-12 signed-out history is guarded on narrow screens', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/history');
  await expect(
    page.getByRole('heading', { name: 'Sign in to view your policies' }),
  ).toBeVisible();
  await signIn(page, 'mali', 'MaliDemo123!');
  await page.getByRole('link', { name: 'Customer change history' }).click();
  await expect(
    page.getByRole('heading', { name: 'Customer change history' }),
  ).toBeVisible();
  await expect(
    page.getByText(/approved changes will appear here/),
  ).toBeVisible();
  await info.attach('Narrow empty history', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
});

for (const width of [1280, 375]) {
  test(`FR-12 approved history visual baseline at ${width}px`, async ({
    page,
  }, info) => {
    test.skip(
      process.platform !== 'win32',
      'FR-12 reviewed Chromium baselines are recorded on Windows',
    );
    await page.setViewportSize({ width, height: 800 });
    await signIn(page, 'mali', 'MaliDemo123!');
    await page.route('**/api/history', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          history: [
            {
              proposalId: 'PROPOSAL-VISUAL-001',
              policyId: 'POL-MALI-001',
              policyLabel: 'Secure Future Plan',
              requestedChange: {
                id: 'REQUEST-VISUAL-001',
                requesterId: 'CUS-002',
                policyId: 'POL-MALI-001',
                createdAt: '2026-11-24T09:00:00.000Z',
                changeType: 'PAYMENT_FREQUENCY',
                requestedEffectiveDate: '2027-01-01',
                paymentFrequency: 'MONTHLY',
              },
              status: 'APPROVED',
              decidedAt: '2026-11-24T10:00:00.000Z',
            },
          ],
        }),
      }),
    );
    await page.getByRole('link', { name: 'Customer change history' }).click();
    await expect(
      page.getByRole('heading', { name: 'Payment frequency: Monthly' }),
    ).toBeVisible();
    const name = `history-approved-${width}.png`;
    const screenshot = {
      fullPage: true,
      animations: 'disabled' as const,
      style: 'nextjs-portal { display: none !important; }',
    };
    if (existsSync(info.snapshotPath(name)))
      await info.attach('Reviewed history baseline', {
        body: await readFile(info.snapshotPath(name)),
        contentType: 'image/png',
      });
    await info.attach('Current history', {
      body: await page.screenshot(screenshot),
      contentType: 'image/png',
    });
    await expect(page).toHaveScreenshot(name, {
      ...screenshot,
      maxDiffPixels: 20,
    });
  });
}
