import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['../../test/setupVitest.ts', '@testing-library/jest-dom/vitest'],
    browser: {
      enabled: false, // enabled through CLI
      name: 'chromium',
      provider: 'playwright',
      headless: !!process.env.CI,
      viewport: {
        width: 1024,
        height: 896,
      },
    },
    coverage: {
      exclude: ['./build/**'],
      reportsDirectory: './.coverage',
      reporter: ['text', 'lcov'],
    },
  },
  resolve: {
    alias: [
      {
        // FIXME(https://github.com/mui/material-ui/issues/35233)
        find: /^@mui\/icons-material\/(?!esm\/)([^/]*)/,
        replacement: '@mui/icons-material/esm/$1',
      },
    ],
  },
});
