module.exports = /** @type {import('jest').Config} */ ({
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  setupFilesAfterEnv: ['<rootDir>/../../test/setupJest.ts'],
  transformIgnorePatterns: ['node_modules/(?!(get-port|lodash-es|nanoid|fractional-indexing)/)'],
});
