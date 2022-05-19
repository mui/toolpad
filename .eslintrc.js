const baseline = require('@mui/monorepo/.eslintrc');

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
    // TODO move rule into main repo to allow deep @mui/monorepo imports
    'no-restricted-imports': ['off'],
    'jsdoc/require-param': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-param-type': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-param-name': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-param-description': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-returns': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-returns-type': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-returns-description': ['error', { contexts: ['TSFunctionType'] }],
  },
  overrides: [
    {
      files: ['./packages/toolpad-app/**/*'],
      extends: ['plugin:@next/next/recommended'],
      rules: {
        '@next/next/no-html-link-for-pages': ['error', 'packages/toolpad-app/pages/'],
      },
    },
    ...baseline.overrides.map((override) => {
      return {
        ...override,
        rules: {
          ...override.rules,
          'no-restricted-imports': ['off'],
          'no-restricted-syntax': [
            'error',
            // From https://github.com/airbnb/javascript/blob/d8cb404da74c302506f91e5928f30cc75109e74d/packages/eslint-config-airbnb-base/rules/style.js#L333
            {
              selector: 'ForInStatement',
              message:
                'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
            },
            // Too opinionated
            // {
            //   selector: 'ForOfStatement',
            //   message:
            //     'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
            // },
            {
              selector: 'LabeledStatement',
              message:
                'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
            },
            {
              selector: 'WithStatement',
              message:
                '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
            },
            // See https://github.com/jsx-eslint/eslint-plugin-react/issues/2073
            {
              selector:
                ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > LogicalExpression[operator='&&']",
              message:
                "Please use `condition ? <Jsx /> : null`. Otherwise, there is a chance of rendering '0' instead of '' in some cases. Context: https://stackoverflow.com/q/53048037",
            },
          ],
        },
      };
    }),
  ],
};
