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
    page.getByRole('heading', { name: 'Sign in to view your policies.' }),
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
  await expect(page.getByText('Arisa K.')).toBeVisible();
  await expect(page.getByText('60%')).toBeVisible();
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
      page.getByRole('heading', { name: 'Request recorded' }),
    ).toBeVisible();
    await expect(
      page.getByText(/pending checks\. Request [0-9a-f-]{36}/),
    ).toBeVisible();
    await expect(
      page.getByText('No policy coverage has changed.'),
    ).toBeVisible();
  });
}

test('FR-07 cited DOCUMENT guidance and mock receipt remain separate', async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await page.getByRole('link', { name: 'Start a change request' }).click();
  await page
    .getByLabel('Change type')
    .selectOption({ label: 'Correspondence address' });
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  await page
    .getByLabel('Correspondence address', { exact: true })
    .last()
    .fill('100 Demo Road');
  await page.getByRole('button', { name: 'Record request' }).click();
  await expect(
    page.getByText(/Address proof may be supplied for a mock receipt/),
  ).toBeVisible();
  await expect(
    page.getByText(
      /Source FAMILY_PROTECTION:ADDRESS:v1 · version 1 · section guidance/,
    ),
  ).toBeVisible();
  await expect(
    page.getByText(/Example guidance from a synthetic fixture/),
  ).toHaveCount(0);
  await page.getByLabel(/Synthetic document/).setInputFiles({
    name: 'fixture.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-synthetic-fixture'),
  });
  await page.getByRole('button', { name: 'Upload synthetic file' }).click();
  await expect(page.getByText('RECEIVED_MOCK')).toBeVisible();
  await expect(
    page.getByText(/contents and suitability were not verified/),
  ).toBeVisible();
});

test('FR-07 cited NONE guidance leaves mock upload available', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await signIn(page);
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await page.getByRole('link', { name: 'Start a change request' }).click();
  await page.getByLabel('Change type').selectOption('PAYMENT_FREQUENCY');
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  await page.getByRole('button', { name: 'Record request' }).click();
  await expect(
    page.getByText(/No document required: No supporting document is required/),
  ).toBeVisible();
  await expect(
    page.getByText(
      /Source FAMILY_PROTECTION:PAYMENT_FREQUENCY:v1 · version 1 · section guidance/,
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Upload synthetic file' }),
  ).toBeDisabled();
});

test('FR-07 service failure leaves guidance unresolved and mock upload usable', async ({
  page,
}) => {
  await signIn(page);
  await page.route('**/api/policies/*/rules?*', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'UNAVAILABLE',
        requiresHumanReferral: true,
        sourceIds: [],
        citations: [],
      }),
    }),
  );
  await page.getByRole('link', { name: /Family Protection Plan/ }).click();
  await page.getByRole('link', { name: 'Start a change request' }).click();
  await page.getByLabel('Change type').selectOption('ADDRESS');
  await page.getByLabel('Requested effective date').fill('2027-01-01');
  await page
    .getByLabel('Correspondence address', { exact: true })
    .last()
    .fill('100 Demo Road');
  await page.getByRole('button', { name: 'Record request' }).click();
  await expect(page.getByText(/Document guidance is unresolved/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Retry guidance' }),
  ).toBeVisible();
  await expect(page.getByText(/Address proof may be supplied/)).toHaveCount(0);
  await page.getByLabel(/Synthetic document/).setInputFiles({
    name: 'fixture.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-synthetic-fixture'),
  });
  await page.getByRole('button', { name: 'Upload synthetic file' }).click();
  await expect(page.getByText('RECEIVED_MOCK')).toBeVisible();
  await expect(
    page.getByText(/contents and suitability were not verified/),
  ).toBeVisible();
});

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
    page.getByRole('heading', { name: 'Request recorded' }),
  ).toHaveCount(0);
});

test('FR-08 recorded address request checks eligibility after its mock upload', async ({
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
  await page.getByLabel(/Synthetic document/).setInputFiles({
    name: 'synthetic.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-synthetic'),
  });
  await page.getByRole('button', { name: 'Upload synthetic file' }).click();
  await expect(page.getByText('RECEIVED_MOCK')).toBeVisible();
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await expect(
    page.getByRole('heading', { name: 'Eligible to continue to a mock quote' }),
  ).toBeVisible();
  await expect(page.getByText(/rule.*version.*section/)).toBeVisible();
  await expect(
    page.getByText(/A mock receipt does not verify document suitability/),
  ).toBeVisible();
});

test('FR-08 payment needs its own receipt, then a fresh check can pass on narrow UI', async ({
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
    page.getByText(/Upload a synthetic file for this request/),
  ).toBeVisible();
  await page.getByLabel(/Synthetic document/).setInputFiles({
    name: 'synthetic.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-synthetic'),
  });
  await page.getByRole('button', { name: 'Upload synthetic file' }).click();
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await expect(
    page.getByRole('heading', { name: 'Eligible to continue to a mock quote' }),
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
    page.getByRole('heading', { name: 'Needs human review' }),
  ).toBeVisible();
  await expect(
    page.getByText(/health disclosure may be needed outside this prototype/),
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
    page.getByRole('heading', { name: 'Eligible to continue to a mock quote' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Check eligibility' }),
  ).toBeEnabled();
});
