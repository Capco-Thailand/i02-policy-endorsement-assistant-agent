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
  maxDiffPixels = 0,
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
  await expect(page).toHaveScreenshot(name, { ...screenshot, maxDiffPixels });
}

async function captureFr16(
  page: Page,
  testInfo: TestInfo,
  screen: 'sign-in' | 'policy-list',
  width: 1280 | 320,
) {
  const name = `fr-16-${screen}-${width}.png`;
  const reference = `_bmad-output/initiative-customer-ui-redesign/ux-fr-16/mockups/${screen}-${width}.png`;
  await testInfo.attach('Accepted UX reference', {
    body: await readFile(reference),
    contentType: 'image/png',
  });
  const screenshot = {
    fullPage: true,
    animations: 'disabled' as const,
    style: 'nextjs-portal { display: none !important; }',
  };
  await testInfo.attach('Current screenshot', {
    body: await page.screenshot(screenshot),
    contentType: 'image/png',
  });
  if (existsSync(testInfo.snapshotPath(name))) {
    await testInfo.attach('Reviewed baseline', {
      body: await readFile(testInfo.snapshotPath(name)),
      contentType: 'image/png',
    });
  }
  await expect(page).toHaveScreenshot(name, screenshot);
}

for (const width of [1280, 320] as const) {
  test(`FR-16 sign-in and policy list visual capture at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.skip(
      process.platform !== 'win32',
      'FR-16 reviewed Chromium baselines are recorded on Windows',
    );
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Sign in to view your policies' }),
    ).toBeVisible();
    await captureFr16(page, testInfo, 'sign-in', width);
    await page.getByLabel('Account ID').fill('narin');
    await page.getByLabel('Password').fill('NarinDemo123!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('POL-NARIN-001')).toBeVisible({
      timeout: 15_000,
    });
    await captureFr16(page, testInfo, 'policy-list', width);
  });
}
