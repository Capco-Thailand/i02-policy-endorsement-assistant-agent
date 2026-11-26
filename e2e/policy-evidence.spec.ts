import { expect, test, type Page } from '@playwright/test';

const api = `http://localhost:${process.env.E2E_API_PORT ?? 3000}`;

async function signIn(page: Page) {
  await page.goto('/');
  await page.getByLabel('Account ID').fill('narin');
  await page.getByLabel('Password').fill('NarinDemo123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your policies' }),
  ).toBeVisible();
}

test('FR-19 policy detail hides evidence UI while the owner-scoped API retains citations', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await signIn(page);
  await page.goto('/policies/POL-NARIN-001');
  await expect(
    page.getByRole('heading', { name: 'Policy facts' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Policy evidence' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Source wording' }),
  ).toHaveCount(0);
  await expect(page.getByRole('link', { name: /View source/ })).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await info.attach('Policy detail without source UI at 320px', {
    body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
    contentType: 'image/png',
  });
  const question = encodeURIComponent('When does protection begin?');
  const owned = await page.request.get(
    `${api}/api/policies/POL-NARIN-001/evidence?query=${question}`,
  );
  expect(owned.status()).toBe(200);
  expect((await owned.json()).citations.length).toBeGreaterThan(0);
  const foreign = await page.request.get(
    `${api}/api/policies/POL-MALI-001/evidence?query=${question}`,
  );
  const unknown = await page.request.get(
    `${api}/api/policies/POL-UNKNOWN/evidence?query=${question}`,
  );
  expect(foreign.status()).toBe(404);
  expect(await foreign.json()).toEqual(await unknown.json());
});

test('FR-19 expired policy keeps facts and request restriction without source UI', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/policies/POL-NARIN-002');
  await expect(page.getByText('THB 500,000', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Policy evidence' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Source wording' }),
  ).toHaveCount(0);
  await expect(page.getByRole('link', { name: /View source/ })).toHaveCount(0);
  await expect(
    page.getByText('This policy is expired. Change requests are unavailable.'),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Start a change request' }),
  ).toHaveCount(0);
});
