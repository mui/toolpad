import { Config } from 'jest';

export default {
  preset: 'ts-jest/presets/default-esm',
  setupFilesAfterEnv: ['<rootDir>/../../test/setupJest.ts'],
} satisfies Config;
