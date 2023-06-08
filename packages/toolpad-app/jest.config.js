const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: __dirname,
});

/** @returns {Promise<import('jest').InitialOptions>} */
async function jestConfig() {
  /** @type {import('jest').InitialOptions} */
  const baseConfig = {
    testEnvironment: '<rootDir>/jest-environment-jsdom.ts',
    setupFilesAfterEnv: ['<rootDir>/../../test/setupJest.ts'],
  };
  /** @type {import('jest').InitialOptions} */
  const nextJestConfig = await createJestConfig(baseConfig)();

  // Workaround, see https://github.com/vercel/next.js/issues/35634#issuecomment-1115250297
  nextJestConfig.transformIgnorePatterns ??= [];
  nextJestConfig.transformIgnorePatterns[0] = '/node_modules/(?!(lodash-es))/';

  return nextJestConfig;
}

module.exports = jestConfig;
