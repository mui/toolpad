const baseline = require('@material-ui/monorepo/.eslintrc');

module.exports = {
  ...baseline,
  plugins: [...baseline.plugins, 'jsdoc'],
  /**
   * Sorted alphanumerically within each group. built-in and each plugin form
   * their own groups.
   */
  rules: {
    ...baseline.rules,
    'import/prefer-default-export': ['off'],
    // TODO move rule into the main repo once it has upgraded
    '@typescript-eslint/return-await': ['off'],
    // TODO move rule into main repo to allow deep @material-ui/monorepo imports
    'no-restricted-imports': ['off'],
    'jsdoc/require-param': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-param-type': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-param-name': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-param-description': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-returns': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-returns-type': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-returns-description': ['error', { contexts: ['TSFunctionType'] }],
    // TODO: resolve these, non critical for pathfinder prototype
    'no-alert': ['off'],
    'no-console': ['off'],
  },
  overrides: baseline.overrides.map((override) => {
    return {
      ...override,
      rules: {
        ...override.rules,
        'no-restricted-imports': ['off'],
      },
    };
  }),
};
