import { expect, test, type Page } from '@playwright/test';

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
      (
        await page.request.get(
          `http://localhost:${process.env.E2E_API_PORT ?? 3000}/api/auth/session`,
        )
      ).status(),
    )
    .toBe(200);
}

test.afterEach(async ({ page }, testInfo) => {
  if (!page.isClosed()) {
    await testInfo.attach('Rendered application', {
      body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
      contentType: 'image/png',
    });
  }
});

for (const width of [1280, 320]) {
  test(`FR-16 sign-in and authorized rows at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect(page.getByText('Prototype only.')).toBeVisible();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Enter your account ID.')).toBeVisible();
    await expect(page.getByLabel('Account ID')).toBeFocused();
    await page.getByLabel('Account ID').fill('narin');
    await page.getByLabel('Password').fill('NarinDemo123!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(
      page.getByRole('link', {
        name: 'View policy: Family Protection Plan, POL-NARIN-001, Active',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', {
        name: 'View policy: Classic Life Plan, POL-NARIN-002, Expired',
      }),
    ).toBeVisible();
    await expect(page.getByText('POL-MALI-001')).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Change history' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('FR-16 sign-in service failure at 320px stays on the form', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  await page.route('**/api/auth/sign-in', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'SERVICE_UNAVAILABLE' }),
    }),
  );
  await page.getByLabel('Account ID').fill('narin');
  await page.getByLabel('Password').fill('NarinDemo123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Sign-in is unavailable' }),
  ).toBeVisible();
  await expect(page.getByText('POL-NARIN-001')).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('FR-16 loading then empty list at 320px names the next state', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await signIn(page);
  let release: (() => void) | undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/policies', async (route) => {
    await held;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ policies: [] }),
    });
  });
  await page.reload();
  await expect(page.getByRole('status')).toHaveText('Loading policies…');
  await expect(page.getByText('POL-NARIN-001')).toHaveCount(0);
  release?.();
  await expect(
    page.getByText('No policies are linked to this account.'),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('FR-16 ended session at 320px clears policy data and explains sign-in', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await signIn(page);
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'UNAUTHORIZED' }),
    }),
  );
  await page.reload();
  await expect(page).toHaveURL(/\/\?ended=1$/);
  await expect(page.getByRole('status')).toHaveText(
    'Your session ended. Sign in again.',
  );
  await expect(page.getByText('POL-NARIN-001')).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('FR-16 list service failure offers retry without stale records at 320px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await signIn(page);
  await page.route('**/api/policies', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'SERVICE_UNAVAILABLE' }),
    }),
  );
  await page.reload();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Could not load policies' }),
  ).toContainText('Could not load policies');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(page.getByText('POL-NARIN-001')).toHaveCount(0);
  await page.unroute('**/api/policies');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('POL-NARIN-001')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('FR-01 AC1: each demo customer signs in and sees only linked policies', async ({
  page,
}) => {
  await signIn(page);
  await expect(page.getByText('POL-NARIN-001')).toBeVisible();
  await expect(page.getByText('POL-NARIN-002')).toBeVisible();
  await expect(page.getByText('POL-MALI-001')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await signIn(page, 'mali', 'MaliDemo123!');
  await expect(page.getByText('POL-MALI-001')).toBeVisible();
  await expect(page.getByText('POL-NARIN-001')).toHaveCount(0);
});

test('FR-01 AC1: invalid credentials show an error without protected data', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Account ID').fill('narin');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(
    page.getByText(
      "We couldn't sign you in. Check your details and try again.",
    ),
  ).toBeVisible();
  await expect(page.getByText('POL-NARIN-001')).toHaveCount(0);
});

test('FR-01 AC3: sign-out removes protected policy data and invalidates the session', async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(
    page.getByRole('heading', { name: 'Sign in to view your policies' }),
  ).toBeVisible();
  await page.goto('/policies');
  await expect(page).toHaveURL(/\/\?ended=1$/);
  await expect(page.getByText('POL-NARIN-001')).toHaveCount(0);
});

test('FR-03 AC1-AC2: linked policy selection shows facts and returns to the list', async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Family Protection Plan' }),
  ).toBeVisible();
  await expect(page.getByText('1 January 2025')).toBeVisible();
  await expect(page.getByText('Arisa K.', { exact: true })).toBeVisible();
  await expect(page.getByText('60%', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /Back to policies/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Your policies' }),
  ).toBeVisible();
});

test('FR-03 AC4: direct foreign and unknown policy URLs show the same unavailable state', async ({
  page,
}) => {
  await signIn(page);
  for (const id of ['POL-MALI-001', 'POL-UNKNOWN']) {
    await page.goto(`/policies/${id}`);
    await expect(
      page.getByRole('heading', { name: 'This policy is unavailable.' }),
    ).toBeVisible();
    await expect(page.getByText('Pim S.')).toHaveCount(0);
  }
});

test('FR-02 AC5: expired policy cannot start a request, including by direct URL', async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole('link', { name: /Classic Life Plan/ }).click();
  await expect(
    page.getByText('This policy is expired. Change requests are unavailable.'),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Start a change request' }),
  ).toHaveCount(0);
  await page.goto('/policies/POL-NARIN-002/request');
  await expect(
    page.getByRole('heading', { name: 'Change request unavailable' }),
  ).toBeVisible();
});

for (const change of [
  {
    label: 'Beneficiary',
    fill: async (page: Page) => {
      await page.getByLabel('Beneficiary name 1').fill('New Person');
      await page.getByLabel('Allocation percent 1').fill('100');
      await expect(page.getByText(/Total allocation: 100%/)).toBeVisible();
    },
  },
  {
    label: 'Correspondence address',
    fill: async (page: Page) => {
      await page
        .getByLabel('Correspondence address', { exact: true })
        .last()
        .fill('100 Demo Road');
    },
  },
  {
    label: 'Payment frequency',
    fill: async (page: Page) => {
      await page.getByLabel('New payment frequency').selectOption('QUARTERLY');
    },
  },
  {
    label: 'Accidental-death rider',
    fill: async (page: Page) => {
      await page
        .getByLabel('Accidental-death rider action')
        .selectOption('REMOVE');
    },
  },
]) {
  test(`FR-02 AC1-AC2: ${change.label} request records one pending change`, async ({
    page,
  }) => {
    await signIn(page);
    await page.getByRole('link', { name: /Family Protection Plan/ }).click();
    await page.getByRole('link', { name: 'Start a change request' }).click();
    await expect(
      page.getByText('Family Protection Plan · POL-NARIN-001'),
    ).toBeVisible();
    await page.getByLabel('Change type').selectOption({ label: change.label });
    await page.getByLabel('Requested effective date').fill('2027-01-01');
    await change.fill(page);
    await page.getByRole('button', { name: 'Record request' }).click();
    await expect(
      page.getByRole('heading', { name: 'Your request was recorded' }),
    ).toBeVisible();
    await expect(
      page.locator('.recorded-request').getByText(/Request [0-9a-f-]{36}/),
    ).toBeVisible();
    await expect(
      page.getByText(/did not approve it or change your policy coverage/),
    ).toBeVisible();
  });
}

test('FR-02 AC3: invalid beneficiary allocation stays editable and creates no request', async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await page.getByRole('link', { name: 'Start a change request' }).click();
  await page.getByLabel('Change type').selectOption('BENEFICIARY');
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  await page.getByLabel('Beneficiary name 1').fill('New Person');
  await page.getByLabel('Allocation percent 1').fill('90');
  await expect(
    page.getByRole('button', { name: 'Record request' }),
  ).toBeDisabled();
  await expect(page.getByLabel('Beneficiary name 1')).toHaveValue('New Person');
  await expect(
    page.getByRole('heading', { name: 'Your request was recorded' }),
  ).toHaveCount(0);
});

test('FR-08 recorded address request checks eligibility without upload', async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await page.getByRole('link', { name: 'Start a change request' }).click();
  await page.getByLabel('Change type').selectOption('ADDRESS');
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  await page
    .getByLabel('Correspondence address', { exact: true })
    .last()
    .fill('100 Synthetic Road');
  await page.getByRole('button', { name: 'Record request' }).click();
  await expect(
    page.getByRole('button', { name: 'Upload synthetic file' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await expect(
    page.getByRole('heading', { name: 'Can proceed to a proposal' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Next action' }),
  ).toBeVisible();
  await expect(page.getByText('Available sources')).toHaveCount(0);
});

test('FR-08 payment can pass without a receipt on narrow UI', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await signIn(page);
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await page.getByRole('link', { name: 'Start a change request' }).click();
  await page.getByLabel('Change type').selectOption('PAYMENT_FREQUENCY');
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  await page.getByRole('button', { name: 'Record request' }).click();
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await expect(
    page.getByRole('heading', { name: 'Can proceed to a proposal' }),
  ).toBeVisible();
});

test('FR-08 rider check refers without asking for health details', async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await page.getByRole('link', { name: 'Start a change request' }).click();
  await page.getByLabel('Change type').selectOption('ACCIDENTAL_DEATH_RIDER');
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  await page.getByRole('button', { name: 'Record request' }).click();
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await expect(
    page.getByRole('heading', { name: 'Needs review' }),
  ).toBeVisible();
  await expect(
    page.getByText(/underwriting or health disclosure may be needed later/),
  ).toBeVisible();
});

test('FR-08 eligibility service failure hides any result and offers retry', async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await page.getByRole('link', { name: 'Start a change request' }).click();
  await page.getByLabel('Change type').selectOption('ADDRESS');
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  await page
    .getByLabel('Correspondence address', { exact: true })
    .last()
    .fill('100 Synthetic Road');
  await page.getByRole('button', { name: 'Record request' }).click();
  await page.route('**/api/policies/*/requests/*/eligibility', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'ELIGIBILITY_UNAVAILABLE' }),
    }),
  );
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: /Could not complete the check/ }),
  ).toHaveText(/Could not complete the check/);
  await expect(
    page.getByRole('heading', { name: 'Can proceed to a proposal' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Check eligibility' }),
  ).toBeEnabled();
});
