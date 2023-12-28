const fse = require('fs-extra');

const { version: transformRuntimeVersion } = fse.readJSONSync(
  require.resolve('@babel/runtime-corejs2/package.json'),
);

const errorCodesPath = require.resolve('@mui/monorepo/docs/public/static/error-codes.json');
const missingError = process.env.MUI_EXTRACT_ERROR_CODES === 'true' ? 'write' : 'annotate';

const muiErrorMacro = require.resolve('@mui/monorepo/packages/mui-babel-macros/MuiError.macro');

module.exports = {
  presets: [
    // backport of https://github.com/zeit/next.js/pull/9511
    ['next/babel', { 'transform-runtime': { corejs: 2, version: transformRuntimeVersion } }],
  ],
  plugins: [
    [
      'babel-plugin-macros',
      {
        muiError: {
          errorCodesPath,
          missingError,
        },
        // TODO: Figure out dependency resolution for macros so this hack isn't needed.
        resolvePath: () => muiErrorMacro,
      },
    ],
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
