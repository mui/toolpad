import type { Config } from '@jest/types';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: __dirname,
});

async function jestConfig(): Promise<Config.InitialOptions> {
  const baseConfig: Config.InitialOptions = {
    testEnvironment: '<rootDir>/jest-environment-jsdom.ts',
    setupFilesAfterEnv: ['<rootDir>/../../test/setupJest.ts'],
  };
  const nextJestConfig: Config.InitialOptions = await createJestConfig(baseConfig)();

  // Workaround, see https://github.com/vercel/next.js/issues/35634#issuecomment-1115250297
  nextJestConfig.transformIgnorePatterns ??= [];
  nextJestConfig.transformIgnorePatterns[0] = '/node_modules/(?!(lodash-es))/';

  return nextJestConfig;
}

export default jestConfig;
