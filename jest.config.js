module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(@mui)/).*'],
  setupFilesAfterEnv: ['<rootDir>/test/utils/jest-setup.ts'],
};
