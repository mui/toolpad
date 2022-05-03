import type { Config } from '@jest/types';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: '<rootDir>/packages/toolpad-app',
});

export default async function createConfig() {
  const nextJestConfig: Config.InitialOptions = await createJestConfig({
    testEnvironment: 'jest-environment-jsdom',
  })();

  // Workaround, see https://github.com/vercel/next.js/issues/35634#issuecomment-1115250297
  nextJestConfig.transformIgnorePatterns[0] = '/node_modules/(?!lodash-es)/';

  const config: Config.InitialOptions = {
    projects: [
      {
        testMatch: ['<rootDir>/packages/toolpad-app/**/*.spec.*'],
        ...nextJestConfig,
      },
    ],
    setupFilesAfterEnv: ['<rootDir>/test/utils/jest-setup.ts'],
  };

  return config;
}
