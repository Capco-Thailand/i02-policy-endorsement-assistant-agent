import { expect, test, type Page, type TestInfo } from '@playwright/test';

async function capture(page: Page, info: TestInfo, name: string) {
  await info.attach(name, {
    body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
    contentType: 'image/png',
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
}

for (const width of [1280, 320]) {
  test(`FR-19 policies, request, assessment, proposal and decision at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect(page.locator('.brand-mark')).toHaveText('PE');
    await expect(page.getByText('Synthetic insurance prototype')).toHaveCount(
      0,
    );
    await page.getByLabel('Account ID').fill('narin');
    await page.getByLabel('Password').fill('NarinDemo123!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    const history = page.getByRole('link', { name: 'Change history' });
    await expect(history).toBeVisible();
    await history.focus();
    await expect(history).toBeFocused();
    await expect(page.locator('.policy-status.active')).toContainText('Active');
    await expect(page.locator('.policy-status.expired')).toContainText(
      'Expired',
    );
    await expect(page.getByText('These are synthetic policies.')).toHaveCount(
      0,
    );
    await capture(page, info, `Policies ${width}px`);

    await page
      .getByRole('link', { name: /View policy: Family Protection Plan/ })
      .click();
    await expect(
      page.getByText(/Synthetic policy data for this prototype/),
    ).toHaveCount(0);
    await page.getByRole('link', { name: 'Start a change request' }).click();
    await page.getByLabel('Change type').selectOption('PAYMENT_FREQUENCY');
    await page.getByLabel('New payment frequency').selectOption('ANNUAL');
    await page.getByLabel('Requested effective date').fill('2027-01-01');
    await page.getByRole('button', { name: 'Record request' }).click();
    await expect(
      page.getByRole('heading', { name: 'Your request was recorded' }),
    ).toBeFocused();
    await expect(page.getByText('Pending checks')).toBeVisible();
    await expect(page.locator('.recorded-request')).toContainText(
      /Request [0-9a-f-]{36}/,
    );
    await expect(page.locator('.recorded-request')).toContainText(
      'Monthly → Annual',
    );
    await expect(page.locator('.recorded-request')).toContainText(
      '1 January 2027',
    );
    await expect(page.locator('.recorded-request')).toContainText(
      'did not approve a change or alter your policy or coverage',
    );
    await capture(page, info, `Recorded request ${width}px`);

    await page.getByRole('button', { name: 'Check eligibility' }).click();
    await expect(
      page.getByRole('heading', { name: 'Can proceed to a proposal' }),
    ).toBeVisible();
    await expect(page.getByText('Next action')).toBeVisible();
    await expect(page.getByText('Available sources')).toHaveCount(0);
    await capture(page, info, `Assessment ${width}px`);
    await page
      .getByRole('button', { name: 'Prepare proposal for review' })
      .click();
    await expect(
      page.getByRole('heading', {
        name: 'Review your proposed change',
      }),
    ).toBeVisible();
    await expect(page.getByText('Pending your decision')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('row', { name: /Life benefit/ })).toContainText(
      'THB',
    );
    await expect(
      page.getByRole('region', { name: 'Annualized scheduled total' }),
    ).toContainText('THB');
    await expect(page.getByRole('row')).toHaveCount(4);
    await expect(page.getByText(/Calculation source/)).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'Assessment and sources' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'This is a non-binding proposal.' }),
    ).toHaveCount(0);
    await capture(page, info, `Proposal ${width}px`);

    if (width === 1280) {
      await page.getByRole('button', { name: 'Approve proposal' }).click();
      await expect(page.getByText('Approved decision recorded')).toBeVisible();
    } else {
      await page.getByRole('button', { name: 'Reject proposal' }).click();
      await page.getByRole('button', { name: 'Confirm rejection' }).click();
      await expect(page.getByText('Rejected decision recorded')).toBeVisible();
    }
    await expect(
      page.getByRole('heading', { name: 'Your decision was recorded' }),
    ).toBeVisible();
    await expect(
      page.getByText('This does not change your policy or coverage.'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Approve proposal' }),
    ).toHaveCount(0);
    await capture(page, info, `Decision ${width}px`);
  });
}
