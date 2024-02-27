const baseline = require('@mui/monorepo/.eslintrc');
const lodash = require('lodash');
const path = require('path');

const ALLOWED_LODASH_METHODS = new Set(['throttle', 'debounce', 'set']);

module.exports = {
  ...baseline,
  settings: {
    'import/resolver': {
      webpack: {
        config: path.join(__dirname, './eslintWebpackResolverConfig.js'),
      },
      exports: {},
    },
  },
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
          {
            name: 'lodash-es',
            importNames: Object.keys(lodash).filter((key) => !ALLOWED_LODASH_METHODS.has(key)),
            message:
              'Avoid kitchensink libraries like lodash-es. We prefer a slightly more verbose, but more universally understood javascript style',
          },
          {
            name: 'react-query',
            message: 'deprecated package, use @tanstack/react-query instead.',
          },
        ],
        patterns: [
          {
            group: ['lodash-es/*'],
            message: 'Use `import { debounce } from "lodash-es";` instead.',
          },
        ],
      },
    ],
    'no-restricted-syntax': [
      ...baseline.rules['no-restricted-syntax'].filter((rule) => {
        // Too opinionated for Toolpad
        return rule?.selector !== 'ForOfStatement';
      }),
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
    'import/no-unresolved': [
      'error',
      {
        // https://github.com/import-js/eslint-plugin-import/issues/1739
        ignore: ['\\.md\\?muiMarkdown$'],
      },
    ],
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            // Don't leak the internal runtime abstraction. It's on its way to be moved towards a separate package
            target: './packages/toolpad-app/src/runtime',
            from: './packages/toolpad-app/src/',
            except: ['./runtime'],
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['examples/**/*'],
      rules: {
        // We use it for demonstration purposes
        'no-console': 'off',
        // Personal preference
        'no-underscore-dangle': 'off',
        // no node_modules in examples as they are not installed
        'import/no-unresolved': 'off',
      },
    },
    {
      files: [
        'packages/create-toolpad-app/**/*',
        'packages/toolpad/**/*',
        'packages/toolpad-app/**/*',
        'packages/toolpad-utils/**/*',
        'packages/toolpad-core/**/*',
        'packages/toolpad-components/**/*',
      ],
      excludedFiles: ['tsup.config.ts', '*.spec.ts', '*.spec.tsx', 'vitest.config.ts'],
      rules: {
        'import/no-extraneous-dependencies': ['error'],
      },
    },
    {
      files: [
        /**
         * Basically all code that is guaranteed being bundled for the client side and never used on serverside code
         * can be dev dependencies to reduce the size of the published package
         */
        'packages/toolpad-app/src/components/**/*',
        'packages/toolpad-app/src/toolpad/**/*',
        'packages/toolpad-app/src/runtime/**/*',
      ],
      excludedFiles: ['*.spec.ts', '*.spec.tsx'],
      rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      },
    },
    {
      // Starting small, we will progressively expand this to more packages.
      files: [
        // 'packages/create-toolpad-app/**/*',
        // 'packages/toolpad/**/*',
        // 'packages/toolpad-app/**/*',
        'packages/toolpad-utils/**/*',
        // 'packages/toolpad-core/**/*',
        // 'packages/toolpad-components/**/*',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': ['error'],
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
  ],
};
