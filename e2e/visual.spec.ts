import { readFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

async function compare(page: Page, testInfo: TestInfo, name: string) {
  const screenshot = {
    fullPage: true,
    animations: 'disabled' as const,
    style: 'nextjs-portal { display: none !important; }',
  };
  await expect(page).toHaveScreenshot(name, screenshot);
  await testInfo.attach('Reviewed baseline', {
    body: await readFile(testInfo.snapshotPath(name)),
    contentType: 'image/png',
  });
  await testInfo.attach('Current screenshot', {
    body: await page.screenshot(screenshot),
    contentType: 'image/png',
  });
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
    await compare(page, testInfo, `policy-detail-${width}.png`);
    await page.getByRole('link', { name: 'Start a change request' }).click();
    await expect(
      page.getByRole('heading', { name: 'Request a policy change' }),
    ).toBeVisible();
    await compare(page, testInfo, `request-form-${width}.png`);
  });
}
