import { PlaywrightTestConfig, devices } from '@playwright/test';

process.env.BROWSER = 'none';

const config: PlaywrightTestConfig<{ toolpadDev: boolean }> = {
  forbidOnly: !!process.env.CI,
  retries: process.env.TOOLPAD_TEST_RETRIES ? Number(process.env.TOOLPAD_TEST_RETRIES) : 0,
  testMatch: /.*.spec.[jt]sx?$/,
  workers: 1,
  use: {
    trace: { mode: 'on-first-retry', screenshots: true },
    screenshot: 'only-on-failure',

    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000/',
  },
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
};

export default config;
