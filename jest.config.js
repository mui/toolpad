module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  testPathIgnorePatterns: ['/dist/'],
  setupFilesAfterEnv: ['<rootDir>/test/utils/jest-setup.ts'],
};
