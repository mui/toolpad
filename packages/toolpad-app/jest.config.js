const transpiledModules = [
  'get-port',
  'lodash-es',
  'nanoid',
  'fractional-indexing',
  'node-fetch',
  'data-uri-to-buffer',
  'fetch-blob',
  'formdata-polyfill',
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
  '@mui/x-charts/esm',
  '@babel/runtime/helpers/esm',
];

module.exports = /** @type {import('jest').Config} */ ({
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  setupFilesAfterEnv: ['<rootDir>/../../test/setupJest.ts'],
  transformIgnorePatterns: [`node_modules/(?!(${transpiledModules.join('|')})/)`],
});
