import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  test: {
    setupFiles: ['../../test/setupVitest.ts', '@testing-library/jest-dom/vitest'],
    coverage: {
      exclude: ['./build/**'],
      reportsDirectory: './.coverage',
      reporter: ['text', 'lcov'],
    },
    server: {
      deps: {
        inline: ['@mui/x-data-grid'], // Fix CSS imports https://github.com/mui/mui-x/issues/17427
      },
    },
  },
});
