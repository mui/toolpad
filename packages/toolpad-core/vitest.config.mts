import { defaultExclude, defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config.base.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      exclude: [...defaultExclude, '**/*.browser.{test,spec}.*'],
    },
  }),
);
