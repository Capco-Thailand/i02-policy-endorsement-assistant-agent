import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

async function start(page: Page, type: 'ADDRESS' | 'PAYMENT_FREQUENCY') {
  await page.goto('/');
  await page.getByLabel('Account ID').fill('narin');
  await page.getByLabel('Password').fill('NarinDemo123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await page.getByRole('link', { name: 'Start a change request' }).click();
  await page.getByLabel('Change type').selectOption(type);
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  if (type === 'ADDRESS')
    await page
      .getByLabel('Correspondence address', { exact: true })
      .last()
      .fill('100 Synthetic Road');
  else await page.getByLabel('New payment frequency').selectOption('ANNUAL');
  await page.getByRole('button', { name: 'Record request' }).click();
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await expect(
    page.getByRole('heading', { name: 'Can proceed to a proposal' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Prepare proposal for review' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Review proposed change' }),
  ).toBeVisible();
}

test.afterEach(async ({ page }, info) => {
  if (!page.isClosed())
    await info.attach('Rendered proposal', {
      body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
      contentType: 'image/png',
    });
});

test('FR-10 unchanged proposal: owner reviews citations, unchanged impact and non-binding status', async ({
  page,
}) => {
  await start(page, 'ADDRESS');
  await expect(page.getByText('PENDING APPROVAL')).toBeVisible();
  await expect(page.getByText('Premium: Unchanged')).toBeVisible();
  await expect(page.getByText('Benefits: Unchanged')).toBeVisible();
  await expect(
    page.getByText(/underlying policy and coverage stay unchanged/),
  ).toBeVisible();
  await expect(
    page.getByText(/Policy wording.*version.*section/).first(),
  ).toBeVisible();
  await expect(
    page.getByText(/Endorsement rule.*version.*section/).first(),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Approve proposal' }),
  ).toBeVisible();
});

test('FR-11 owner approves and sees a recorded non-binding decision', async ({
  page,
}) => {
  await start(page, 'ADDRESS');
  await page.getByRole('button', { name: 'Approve proposal' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your decision was recorded' }),
  ).toBeVisible();
  await expect(page.getByText(/Approved on/)).toBeVisible();
  await expect(
    page.getByText('This does not change your policy or coverage.'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Approve proposal' }),
  ).toHaveCount(0);
});

test('FR-11 rejection needs confirmation and Cancel preserves the proposal', async ({
  page,
}) => {
  await start(page, 'ADDRESS');
  await page.getByRole('button', { name: 'Reject proposal' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(
    page.getByRole('button', { name: 'Reject proposal' }),
  ).toBeFocused();
  await expect(page.getByText('PENDING APPROVAL')).toBeVisible();
  await page.getByRole('button', { name: 'Reject proposal' }).click();
  await page.getByRole('button', { name: 'Confirm rejection' }).click();
  await expect(page.getByText(/Rejected on/)).toBeVisible();
});

test('FR-11 failed decision stays retryable and a retry records it', async ({
  page,
}) => {
  await start(page, 'ADDRESS');
  let failOnce = true;
  await page.route('**/proposals/*/decision', async (route) => {
    if (failOnce) {
      failOnce = false;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'DECISION_UNAVAILABLE' }),
      });
    } else await route.continue();
  });
  await page.getByRole('button', { name: 'Approve proposal' }).click();
  await expect(
    page.getByText('Your decision was not recorded. Try again.'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Approve proposal' }),
  ).toBeEnabled();
  await page.getByRole('button', { name: 'Approve proposal' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your decision was recorded' }),
  ).toBeVisible();
});

test('FR-11 foreign customer sees the same unavailable proposal state as an unknown ID', async ({
  page,
}) => {
  await start(page, 'ADDRESS');
  const ownedPath = new URL(page.url()).pathname;
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(
    page.getByRole('heading', { name: 'Sign in to view your policies.' }),
  ).toBeVisible();
  await page.getByLabel('Account ID').fill('mali');
  await page.getByLabel('Password').fill('MaliDemo123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your policies' }),
  ).toBeVisible();
  await expect(page.getByText('POL-MALI-001')).toBeVisible();
  const foreignResponse = await page.request.get(
    `http://localhost:${process.env.E2E_API_PORT ?? 3000}/api${ownedPath}`,
  );
  expect(foreignResponse.status()).toBe(404);
  await page.goto(ownedPath);
  await expect(page.getByText('This proposal is unavailable.')).toBeVisible();
  await page.goto(
    ownedPath.replace(/\/proposals\/[^/]+$/, '/proposals/unknown'),
  );
  await expect(page.getByText('This proposal is unavailable.')).toBeVisible();
});

test('FR-10 calculated proposal: narrow review shows exact THB values and owner boundary', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await start(page, 'PAYMENT_FREQUENCY');
  await expect(page.getByText('THB 1,215.00')).toBeVisible();
  await expect(page.getByText('THB 13,500.00').first()).toBeVisible();
  await expect(page.getByText(/THB 1,000,000 · Unchanged/)).toBeVisible();
  await info.attach('Narrow proposal review', {
    body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
    contentType: 'image/png',
  });
  const proposalPath = new URL(page.url()).pathname;
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(
    page.getByRole('heading', { name: 'Sign in to view your policies.' }),
  ).toBeVisible();
  await page.goto(proposalPath);
  await expect(page).toHaveURL(/\?ended=1$/);
});

for (const width of [1280, 375]) {
  test(`FR-10 proposal visual baseline at ${width}px`, async ({
    page,
  }, info) => {
    test.skip(
      process.platform !== 'darwin',
      'FR-10 reviewed Chromium baselines are recorded on macOS',
    );
    await page.setViewportSize({ width, height: 800 });
    await start(page, 'PAYMENT_FREQUENCY');
    const name = `proposal-review-${width}.png`;
    const screenshot = {
      fullPage: true,
      animations: 'disabled' as const,
      style: 'nextjs-portal { display: none !important; }',
      mask: [page.locator('.policy-id')],
      maskColor: '#ffffff',
    };
    if (existsSync(info.snapshotPath(name)))
      await info.attach('Reviewed proposal baseline', {
        body: await readFile(info.snapshotPath(name)),
        contentType: 'image/png',
      });
    await info.attach('Current proposal', {
      body: await page.screenshot(screenshot),
      contentType: 'image/png',
    });
    await expect(page).toHaveScreenshot(name, {
      ...screenshot,
      maxDiffPixels: 20,
    });
  });
}
