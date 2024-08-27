// @ts-check
/**
 * @typedef {import('@babel/core')} babel
 */

const productionPlugins = [
  ['babel-plugin-react-remove-properties', { properties: ['data-mui-test'] }],
];

/** @type {babel.ConfigFunction} */
module.exports = function getBabelConfig(api) {
  const useESModules = !api.env(['node']);

  const presets = [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        browserslistEnv: process.env.BABEL_ENV || process.env.NODE_ENV,
        debug: process.env.MUI_BUILD_VERBOSE === 'true',
        modules: useESModules ? false : 'commonjs',
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
    '@babel/preset-typescript',
  ];

  const outFileExtension = '.js';

  /** @type {babel.PluginItem[]} */
  const plugins = [
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules,
        // any package needs to declare 7.4.4 as a runtime dependency. default is ^7.0.0
        version: '^7.4.4',
      },
    ],
    [
      'babel-plugin-transform-react-remove-prop-types',
      {
        mode: 'unsafe-wrap',
      },
    ],
  ];

  if (process.env.NODE_ENV === 'production') {
    plugins.push(...productionPlugins);
  }

  if (useESModules) {
    plugins.push([
      '@mui/internal-babel-plugin-resolve-imports',
      {
        // Don't replace the extension when we're using aliases.
        // Essentially only replace in production builds.
        outExtension: outFileExtension,
      },
    ]);
  }

  return {
    assumptions: {
      noDocumentAll: true,
    },
    presets,
    plugins,
    ignore: [/@babel[\\|/]runtime/], // Fix a Windows issue.
    overrides: [
      {
        exclude: /\.test\.(js|ts|tsx)$/,
        plugins: ['@babel/plugin-transform-react-constant-elements'],
      },
    ],
  };
};
