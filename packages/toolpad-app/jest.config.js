const nextJest = require('next/jest');

const createJestConfig = nextJest();

async function jestConfig() {
  const nextJestConfig = await createJestConfig({
    testEnvironment: 'jest-environment-jsdom',
  })();
  // Workaround, see https://github.com/vercel/next.js/issues/35634#issuecomment-1115250297
  nextJestConfig.transformIgnorePatterns[0] = '/node_modules/(?!lodash-es)/';
  return nextJestConfig;
}

module.exports = jestConfig;
