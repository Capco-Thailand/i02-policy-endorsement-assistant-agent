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
    page.getByRole('button', { name: /Approve|Reject/ }),
  ).toHaveCount(0);
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
