module.exports = function getBabelConfig(api) {
  const useESModules = api.env(['regressions', 'legacy', 'modern', 'stable', 'rollup']);

  const presets = [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        browserslistEnv: process.env.BABEL_ENV || process.env.NODE_ENV,
        modules: useESModules ? false : 'commonjs',
        shippedProposals: api.env('modern'),
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

  const plugins = [
    'babel-plugin-optimize-clsx',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules,
      },
    ],
    [
      'babel-plugin-transform-react-remove-prop-types',
      {
        mode: 'unsafe-wrap',
      },
    ],
  ];

  return {
    assumptions: {
      noDocumentAll: true,
    },
    presets,
    plugins,
    overrides: [
      {
        exclude: /\.test\.(js|ts|tsx)$/,
        plugins: ['@babel/plugin-transform-react-constant-elements'],
      },
    ],
  };
};
