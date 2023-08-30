const esModules = [
  'get-port',
  'lodash-es',
  'nanoid',
  'fractional-indexing',
  'd3-scale',
  'd3-array',
  'internmap',
  'd3-interpolate',
  'd3-color',
  'd3-format',
  'd3-time',
  'd3-time-format',
  'd3-shape',
  'd3-path',
].join('|');

module.exports = /** @type {import('jest').Config} */ ({
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  setupFilesAfterEnv: ['<rootDir>/../../test/setupJest.ts'],
  transformIgnorePatterns: [`node_modules/(?!(${esModules})/)`],
});
