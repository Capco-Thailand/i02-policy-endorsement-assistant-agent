import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  expect,
  test,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test';

async function compare(
  page: Page,
  testInfo: TestInfo,
  name: string,
  mask?: Locator,
) {
  const screenshot = {
    fullPage: true,
    animations: 'disabled' as const,
    style: 'nextjs-portal { display: none !important; }',
    mask: mask ? [mask] : [],
    maskColor: '#ffffff',
  };
  const current = await page.screenshot(screenshot);
  if (!existsSync(testInfo.snapshotPath(name))) {
    await testInfo.attach('Current screenshot awaiting reviewed baseline', {
      body: current,
      contentType: 'image/png',
    });
    testInfo.annotations.push({
      type: 'visual-baseline-pending',
      description: name,
    });
    throw new Error(`Reviewed visual baseline missing: ${name}`);
  }
  await testInfo.attach('Reviewed baseline', {
    body: await readFile(testInfo.snapshotPath(name)),
    contentType: 'image/png',
  });
  await testInfo.attach('Current screenshot', {
    body: current,
    contentType: 'image/png',
  });
  await expect(page).toHaveScreenshot(name, screenshot);
}

for (const width of [1280, 375]) {
  test(`FR-01, FR-03, FR-02 visual baseline at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.skip(
      process.platform !== 'darwin',
      'Reviewed Chromium baselines are recorded on macOS',
    );
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Sign in to view your policies.' }),
    ).toBeVisible();
    await compare(page, testInfo, `sign-in-${width}.png`);
    await page.getByLabel('Account ID').fill('narin');
    await page.getByLabel('Password').fill('NarinDemo123!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('POL-NARIN-001')).toBeVisible();
    await compare(page, testInfo, `policies-${width}.png`);
    await page.getByRole('link', { name: /Family Protection Plan/ }).click();
    await expect(
      page.getByRole('heading', { name: 'Family Protection Plan' }),
    ).toBeVisible();
    await expect(page.getByText('Matches policy facts')).toBeVisible();
    await compare(page, testInfo, `policy-detail-${width}.png`);
    await page.getByRole('link', { name: 'Start a change request' }).click();
    await expect(
      page.getByRole('heading', { name: 'Request a policy change' }),
    ).toBeVisible();
    await compare(page, testInfo, `request-form-${width}.png`);
  });
}

for (const width of [1280, 375]) {
  test(`FR-08 eligibility result visual baseline at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.skip(
      process.platform !== 'linux',
      'FR-08 reviewed Chromium baselines are recorded on Linux CI',
    );
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await page.getByLabel('Account ID').fill('narin');
    await page.getByLabel('Password').fill('NarinDemo123!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('link', { name: /Family Protection Plan/ }).click();
    await page.getByRole('link', { name: 'Start a change request' }).click();
    await page.getByLabel('Change type').selectOption('ADDRESS');
    await page.getByLabel('Requested effective date').fill('2027-01-01');
    await page
      .getByLabel('Correspondence address', { exact: true })
      .last()
      .fill('100 Synthetic Road');
    await page.getByRole('button', { name: 'Record request' }).click();
    await page.getByLabel(/Synthetic document/).setInputFiles({
      name: 'synthetic.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-synthetic'),
    });
    await page.getByRole('button', { name: 'Upload synthetic file' }).click();
    await expect(page.getByText('RECEIVED_MOCK')).toBeVisible();
    await page.getByRole('button', { name: 'Check eligibility' }).click();
    await expect(
      page.getByRole('heading', {
        name: 'Eligible to continue to a mock quote',
      }),
    ).toBeVisible();
    await compare(
      page,
      testInfo,
      `eligibility-${width}.png`,
      page.locator('.request-id'),
    );
  });
}
