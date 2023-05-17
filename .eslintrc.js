const baseline = require('@mui/monorepo/.eslintrc');

module.exports = {
  ...baseline,
  extends: [
    ...baseline.extends,
    // Motivation: https://github.com/shian15810/eslint-plugin-typescript-enum#motivations
    'plugin:typescript-enum/recommended',
  ],
  /**
   * Sorted alphanumerically within each group. built-in and each plugin form
   * their own groups.
   */
  rules: {
    ...baseline.rules,
    'import/prefer-default-export': ['off'],
    // TODO move rule into the main repo once it has upgraded
    '@typescript-eslint/return-await': ['off'],

    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@mui/icons-material',
            message: 'Use @mui/icons-material/<Icon> instead.',
          },
        ],
      },
    ],
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
    // Turning react/jsx-key back on.
    // https://github.com/airbnb/javascript/blob/5155aa5fc1ea9bb2c6493a06ddbd5c7a05414c86/packages/eslint-config-airbnb/rules/react.js#L94
    'react/jsx-key': ['error', { checkKeyMustBeforeSpread: true, warnOnDuplicates: true }],
    // This got turned of in the mono-repo:
    // See https://github.com/mui/mui-toolpad/pull/866#discussion_r957222171
    'react/no-unused-prop-types': [
      'error',
      {
        customValidators: [],
        skipShapeProps: true,
      },
    ],
  },
  overrides: [
    {
      files: ['packages/toolpad-app/**/*'],
      extends: ['plugin:@next/next/recommended'],
      rules: {
        '@next/next/no-html-link-for-pages': ['error', 'packages/toolpad-app/pages/'],
        '@next/next/no-img-element': 'off',
      },
    },
    {
      files: ['packages/toolpad-app/**/*'],
      excludedFiles: ['**/jest-environment-jsdom.ts', 'tsup.config.ts', '*.spec.ts', '*.spec.tsx'],
      rules: {
        'import/no-extraneous-dependencies': ['error'],
      },
    },
    {
      files: ['packages/toolpad-app/pages/**/*'],
      rules: {
        // The pattern is useful to type Next.js pages
        'react/function-component-definition': 'off',
      },
    },
    {
      // Disabling this rule for now:
      // https://github.com/mui/material-ui/blob/9737bc85bb6960adb742e7709e9c3710c4b6cedd/.eslintrc.js#L359
      files: ['packages/*/src/**/*{.ts,.tsx,.js}'],
      excludedFiles: ['*.d.ts', '*.spec.ts', '*.spec.tsx'],
      rules: {
        'import/no-cycle': ['error', { ignoreExternal: true }],
      },
    },
    {
      files: ['packages/toolpad-core/**/*', 'packages/toolpad-components/**/*'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                // Running into issues with @mui/icons-material not being an ESM package, while the
                // toolpad-core package is. This makes Next.js try to load @mui/icons-material/* as ESM
                // We'll just avoid importing icons in these packages
                // Remove restriction after https://github.com/mui/material-ui/pull/30510 gets resolved
                group: ['@mui/icons-material', '@mui/icons-material/*'],
                message: "Don't use @mui/icons-material in these packages for now.",
              },
            ],
          },
        ],
      },
    },
  ],
};
