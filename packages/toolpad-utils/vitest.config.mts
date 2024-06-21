import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['../../test/setupVitest.ts'],
    coverage: {
      exclude: ['./dist/**'],
      reportsDirectory: './.coverage',
      reporter: ['text', 'lcov'],
    },
  },
});
