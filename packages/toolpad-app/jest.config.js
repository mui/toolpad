const transpiledModules = [
  'get-port',
  'lodash-es',
  'nanoid',
  'fractional-indexing',
  'node-fetch',
  'data-uri-to-buffer',
  'fetch-blob',
  'formdata-polyfill',
];

module.exports = /** @type {import('jest').Config} */ ({
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  setupFilesAfterEnv: ['<rootDir>/../../test/setupJest.ts'],
  transformIgnorePatterns: [`node_modules/.pnpm/(?!(${transpiledModules.join('|')})\\W)`],
});
