import { defineConfig, devices } from '@playwright/test';

const apiPort = Number(process.env.E2E_API_PORT ?? 3000);
const webPort = Number(process.env.E2E_WEB_PORT ?? 3001);
const calculatorPort = Number(process.env.E2E_CALCULATOR_PORT ?? 3002);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder:
          process.env.PLAYWRIGHT_HTML_OUTPUT_DIR ?? 'playwright-report',
      },
    ],
  ],
  outputDir: 'test-results/artifacts',
  use: {
    baseURL: `http://localhost:${webPort}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run start -w apps/calculator',
      url: `http://localhost:${calculatorPort}/health`,
      env: { CALCULATOR_PORT: String(calculatorPort) },
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npm run start -w apps/api',
      url: `http://localhost:${apiPort}/openapi.json`,
      env: {
        API_PORT: String(apiPort),
        WEB_ORIGIN: `http://localhost:${webPort}`,
        CALCULATOR_URL: `http://127.0.0.1:${calculatorPort}`,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `npx next start -p ${webPort}`,
      cwd: 'apps/web',
      url: `http://localhost:${webPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
