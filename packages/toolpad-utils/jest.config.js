export default /** @type {import('jest').Config} */ ({
  preset: 'ts-jest/presets/default-esm',
  setupFilesAfterEnv: ['<rootDir>/../../test/setupJest.ts'],
});
