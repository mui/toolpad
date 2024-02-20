const fse = require('fs-extra');

const { version: transformRuntimeVersion } = fse.readJSONSync(
  require.resolve('@babel/runtime-corejs2/package.json'),
);

module.exports = {
  presets: [
    // backport of https://github.com/zeit/next.js/pull/9511
    ['next/babel', { 'transform-runtime': { corejs: 2, version: transformRuntimeVersion } }],
  ],
  plugins: [
    'babel-plugin-optimize-clsx',
    // for IE 11 support
    '@babel/plugin-transform-object-assign',
    'babel-plugin-preval',
  ],
  ignore: [
    // Fix a Windows issue.
    /@babel[\\|/]runtime/,
    // Fix const foo = /{{(.+?)}}/gs; crashing.
    /prettier/,
    /@mui[\\|/]docs[\\|/]markdown/,
  ],
  env: {
    production: {
      plugins: [
        // TODO fix useGridSelector side effect and enable back.
        // '@babel/plugin-transform-react-constant-elements',
        ['babel-plugin-react-remove-properties', { properties: ['data-mui-test'] }],
        ['babel-plugin-transform-react-remove-prop-types', { mode: 'remove' }],
      ],
    },
  },
};
