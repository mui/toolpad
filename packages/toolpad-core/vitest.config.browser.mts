import { defineConfig, mergeConfig } from 'vitest/config';
import * as path from 'path';
import baseConfig from './vitest.config.base.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        headless: !!process.env.CI,
        screenshotDirectory: path.resolve(
          import.meta.dirname,
          '../../test/regressions/screenshots/chrome/toolpad-core',
        ),
        viewport: {
          width: 1024,
          height: 896,
        },
      },
    },
  }),
);
