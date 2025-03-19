import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config.base.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['**/*[!.browser].{test,spec}.?(c|m)[jt]s?(x)'],
      coverage: {
        exclude: ['./build/**'],
        reportsDirectory: './.coverage',
        reporter: ['text', 'lcov'],
      },
    },
  }),
);
