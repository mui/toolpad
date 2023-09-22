import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['<rootDir>/../../test/setupVitest.ts'],
  },
});
