module.exports = /** @type {import('jest').Config} */ ({
  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  setupFilesAfterEnv: ['<rootDir>/../../test/setupJest.ts'],
  transformIgnorePatterns: ['node_modules/(?!(get-port|lodash-es|nanoid|fractional-indexing)/)'],
});
