module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {}],
  },
  setupFilesAfterEnv: ['<rootDir>/test/utils/jest-setup.ts'],
};
