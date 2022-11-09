import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  use: {
    trace: 'on-first-retry',
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000/',
  },
  globalSetup: '../playwright/global-setup',
  globalTeardown: '../playwright/global-teardown',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    !process.env.SKIP_FF
      ? {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        }
      : {},
  ],
};

export default config;
