import { devices, defineConfig } from '@playwright/test';

process.env.BROWSER = 'none';

function getShard() {
  if (process.env.CIRCLE_NODE_INDEX && process.env.CIRCLE_NODE_TOTAL) {
    const current = Number(process.env.CIRCLE_NODE_INDEX) + 1;
    const total = Number(process.env.CIRCLE_NODE_TOTAL);
    return { current, total };
  }
  return undefined;
}

export default defineConfig({
  shard: getShard(),
  forbidOnly: !!process.env.CI,
  retries: process.env.TOOLPAD_TEST_RETRIES ? Number(process.env.TOOLPAD_TEST_RETRIES) : 0,
  testMatch: /.*.spec.[jt]sx?$/,
  workers: process.env.CI ? 1 : 1,
  timeout: process.env.TOOLPAD_NEXT_DEV ? 60000 : 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    trace: { mode: 'on-first-retry', screenshots: true },
    screenshot: 'only-on-failure',

    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000/',
  },
  reporter: [['list'], ['junit', { outputFile: 'test-results/junit.xml' }]],
  projects: [
    {
      name: 'chromium',
      testDir: './integration',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testDir: './integration',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'visual',
      testDir: './visual',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
