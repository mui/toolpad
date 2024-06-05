import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['../../test/setupVitest.ts'],
    browser: {
      enabled: !process.env.CI,
      name: 'chromium',
      provider: 'playwright',
    },
  },
});
