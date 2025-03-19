import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  test: {
    setupFiles: ['../../test/setupVitest.ts', '@testing-library/jest-dom/vitest'],
    include: ['**/*[!.browser].{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      exclude: ['./build/**'],
      reportsDirectory: './.coverage',
      reporter: ['text', 'lcov'],
    },
  },
});
