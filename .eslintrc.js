const baseline = require('@mui/monorepo/.eslintrc');
const path = require('path');
const lodash = require('lodash');

const ENABLE_REACT_COMPILER_PLUGIN = false;

const ALLOWED_LODASH_METHODS = new Set(['throttle', 'debounce', 'set']);

const noRestrictedImports = {
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
};

module.exports = {
  ...baseline,
  plugins: [
    ...baseline.plugins,
    ...(ENABLE_REACT_COMPILER_PLUGIN ? ['eslint-plugin-react-compiler'] : []),
    'testing-library',
  ],
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
    // TODO move to @mui/monorepo, codebase is moving away from default exports
    'import/prefer-default-export': 'off',
    // TODO move rule into the main repo once it has upgraded
    '@typescript-eslint/return-await': 'off',
    'no-restricted-imports': ['error', noRestrictedImports],
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
            target: './packages/toolpad-studio/src/runtime',
            from: './packages/toolpad-studio/src/',
            except: ['./runtime'],
          },
        ],
      },
    ],
    'material-ui/no-hardcoded-labels': 'off', // We are not really translating the docs/website anymore
    ...(ENABLE_REACT_COMPILER_PLUGIN ? { 'react-compiler/react-compiler': 'error' } : {}),
  },
  overrides: [
    ...baseline.overrides,
    {
      files: ['**/*.test.js', '**/*.test.ts', '**/*.test.tsx'],
      extends: ['plugin:testing-library/react'],
    },
    {
      files: ['docs/src/modules/components/**/*.js'],
      rules: {
        'material-ui/no-hardcoded-labels': 'off',
      },
    },
    {
      /**
       * TODO move to @mui/monorepo
       *
       * Examples are for demostration purposes and should not be considered as part of the library.
       * They don't contain an eslint setup, so we don't want them to contain eslint directives
       * We do however want to keep the rules in place to ensure the examples are following
       * a reasonably similar code style as the library.
       */
      files: ['examples/**/*'],
      rules: {
        'no-console': 'off',
        'no-underscore-dangle': 'off',
        // no node_modules in examples as they are not installed
        'import/no-unresolved': 'off',
      },
    },
    {
      files: [
        'packages/create-toolpad-app/**/*',
        'packages/toolpad-core/**/*',
        'packages/toolpad-studio/**/*',
        'packages/toolpad-studio-components/**/*',
        'packages/toolpad-studio-runtime/**/*',
        'packages/toolpad-utils/**/*',
      ],
      excludedFiles: [
        'tsup.config.ts',
        '*.spec.ts',
        '*.spec.tsx',
        '*.test.ts',
        '*.test.tsx',
        'vitest.config.mts',
      ],
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
        'packages/toolpad-studio/src/components/**/*',
        'packages/toolpad-studio/src/toolpad/**/*',
        'packages/toolpad-studio/src/runtime/**/*',
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
        // 'packages/toolpad-core/**/*',
        // 'packages/toolpad-studio/**/*',
        // 'packages/toolpad-studio/**/*',
        'packages/toolpad-utils/**/*',
        // 'packages/toolpad-studio-runtime/**/*',
        // 'packages/toolpad-studio-components/**/*',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': ['error'],
      },
    },
    {
      files: ['packages/toolpad-studio/pages/**/*'],
      rules: {
        // The pattern is useful to type Next.js pages
        'react/function-component-definition': 'off',
      },
    },
    // TODO remove, fix this rule in the codebase
    {
      files: ['**'],
      rules: {
        'no-restricted-imports': ['error', noRestrictedImports],
      },
    },
  ],
};
