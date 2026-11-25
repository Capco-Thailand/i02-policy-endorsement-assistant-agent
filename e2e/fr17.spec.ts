import { expect, test, type Page } from '@playwright/test';

async function openRequest(page: Page, width = 1280) {
  await page.setViewportSize({ width, height: 800 });
  await page.goto('/');
  await page.getByLabel('Account ID').fill('narin');
  await page.getByLabel('Password').fill('NarinDemo123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await page.getByRole('link', { name: 'Start a change request' }).click();
  await expect(
    page.getByRole('heading', { name: 'Request a policy change' }),
  ).toBeVisible();
}

test.afterEach(async ({ page }, info) => {
  if (!page.isClosed()) {
    await info.attach('FR-17 rendered application', {
      body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
      contentType: 'image/png',
    });
  }
});

for (const width of [1280, 320]) {
  test(`FR-17 current/requested values and 320px layout at ${width}px`, async ({
    page,
  }, info) => {
    await openRequest(page, width);
    const change = page.getByLabel('Change type');
    await change.selectOption('BENEFICIARY');
    await expect(
      page.getByRole('heading', { name: 'Current policy' }),
    ).toBeVisible();
    await expect(page.locator('.request-current-beneficiaries')).toContainText(
      '%',
    );
    await expect(
      page.getByRole('heading', { name: 'Requested change' }),
    ).toBeVisible();
    await page.getByLabel('Beneficiary name 1').fill('New Person');
    await page.getByLabel('Allocation percent 1').fill('90');
    await expect(
      page.getByText(/Total allocation: 90%.*Under 100%/),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Record request' }),
    ).toBeDisabled();
    await page.getByLabel('Allocation percent 1').fill('110');
    await expect(
      page.getByText(/Total allocation: 110%.*Over 100%/),
    ).toBeVisible();
    await page.getByLabel('Allocation percent 1').fill('100');
    await expect(
      page.getByText(/Total allocation: 100%.*Exactly 100%/),
    ).toBeVisible();

    await change.selectOption('ADDRESS');
    await expect(
      page.getByText('Not available in this policy record.'),
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Correspondence address' }),
    ).toBeVisible();
    await change.selectOption('PAYMENT_FREQUENCY');
    await expect(page.locator('.request-context')).toContainText('Monthly');
    await expect(page.getByLabel('New payment frequency')).toBeVisible();
    await change.selectOption('ACCIDENTAL_DEATH_RIDER');
    await expect(
      page.getByText('Current rider on/off state is not supplied.'),
    ).toBeVisible();
    await expect(
      page.getByLabel('Accidental-death rider action'),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'View cited policy term' }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
    await change.selectOption('BENEFICIARY');
    await expect(
      page.getByText(/Total allocation: 100%.*Exactly 100%/),
    ).toBeVisible();
    await info.attach(`Accepted FR-17 request ${width}px reference`, {
      path: `design/page/fr-17-request-${width}.png`,
      contentType: 'image/png',
    });
    if (process.platform === 'win32') {
      await expect(page).toHaveScreenshot(`fr-17-request-${width}.png`, {
        fullPage: true,
        animations: 'disabled',
        style: 'nextjs-portal { display: none !important; }',
      });
    }
  });
}

for (const width of [1280, 320]) {
  test(`FR-17 recorded request and server eligibility at ${width}px`, async ({
    page,
  }, info) => {
    await openRequest(page, width);
    await page.getByLabel('Change type').selectOption('ADDRESS');
    await page
      .getByRole('textbox', { name: 'Correspondence address' })
      .fill('100 Synthetic Road');
    await page.getByLabel('Requested effective date').fill('2027-01-01');
    await page.getByRole('button', { name: 'Record request' }).click();
    await expect(
      page.getByRole('heading', { name: 'Pending checks' }),
    ).toBeVisible();
    await expect(page.locator('.recorded-request')).toContainText(
      /Request ID: [0-9a-f-]{36}/,
    );
    await expect(page.locator('.recorded-request')).toContainText(
      'No policy coverage has changed.',
    );
    await expect(page.getByText('Not checked yet.')).toBeVisible();
    let proposalCalls = 0;
    page.on('request', (request) => {
      if (
        request.method() === 'POST' &&
        /\/requests\/[^/]+\/proposal$/.test(request.url())
      )
        proposalCalls++;
    });
    await page.getByRole('button', { name: 'Check eligibility' }).click();
    await expect(
      page.getByRole('heading', { name: 'Can proceed to a proposal' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reason' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Next action' }),
    ).toBeVisible();
    await expect(page.getByText(/Rule .*version .*section/)).toBeVisible();
    expect(proposalCalls).toBe(0);
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
    await info.attach(`Accepted FR-17 eligibility ${width}px reference`, {
      path: `design/page/fr-17-eligibility-${width}.png`,
      contentType: 'image/png',
    });
    if (process.platform === 'win32') {
      await expect(page).toHaveScreenshot(`fr-17-eligibility-${width}.png`, {
        fullPage: true,
        animations: 'disabled',
        style: 'nextjs-portal { display: none !important; }',
        mask: [page.locator('.request-id')],
        maskColor: '#ffffff',
      });
    }
  });
}

test('FR-17 rider referral remains unresolved and offers a next action', async ({
  page,
}) => {
  await openRequest(page);
  await page.getByLabel('Change type').selectOption('ACCIDENTAL_DEATH_RIDER');
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  await page.getByRole('button', { name: 'Record request' }).click();
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await expect(
    page.getByRole('heading', { name: 'Needs review' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Reason' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Next action' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Prepare proposal/ }),
  ).toHaveCount(0);
});

test('FR-17 keyboard entry and request service error remain usable at 320px', async ({
  page,
}) => {
  await openRequest(page, 320);
  await page.getByLabel('Change type').selectOption('BENEFICIARY');
  await page.getByRole('button', { name: 'Add beneficiary' }).focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('textbox', { name: 'Beneficiary name 2' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Remove beneficiary 2' }).focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('textbox', { name: 'Beneficiary name 2' }),
  ).toHaveCount(0);
  await page.getByLabel('Change type').selectOption('ADDRESS');
  await page
    .getByRole('textbox', { name: 'Correspondence address' })
    .fill('100 Synthetic Road');
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  await page.route('**/api/policies/*/requests', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'API_UNAVAILABLE' }),
    }),
  );
  await page.getByRole('button', { name: 'Record request' }).focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Could not record request' }),
  ).toHaveText('Could not record request. Try again.');
  await expect(
    page.getByRole('textbox', { name: 'Correspondence address' }),
  ).toHaveValue('100 Synthetic Road');
  await expect(
    page.getByRole('button', { name: 'Record request' }),
  ).toBeEnabled();
});

test('FR-17 cannot proceed uses server decision and does not prepare a proposal', async ({
  page,
}) => {
  await openRequest(page);
  await page.getByLabel('Change type').selectOption('ADDRESS');
  await page
    .getByRole('textbox', { name: 'Correspondence address' })
    .fill('100 Synthetic Road');
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  await page.getByRole('button', { name: 'Record request' }).click();
  await page.route('**/api/policies/*/requests/*/eligibility', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        outcome: 'CANNOT_PROCEED',
        reasonCodes: ['RULE_BLOCK'],
        reasons: ['The requested change cannot proceed under this policy.'],
        nextStep: 'Return to your policy.',
        sourceIds: ['SYNTHETIC:RULE'],
        citations: [],
      }),
    }),
  );
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await expect(
    page.getByRole('heading', { name: 'Cannot proceed' }),
  ).toBeVisible();
  await expect(
    page.getByText('The requested change cannot proceed under this policy.'),
  ).toBeVisible();
  await expect(page.getByText('Return to your policy.')).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Prepare proposal/ }),
  ).toHaveCount(0);
});
