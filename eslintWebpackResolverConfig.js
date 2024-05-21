const path = require('path');

module.exports = {
  context: path.resolve(__dirname),
  resolve: {
    modules: [__dirname, 'node_modules'],
    alias: {
      '@mui/docs': path.resolve(__dirname, './node_modules/@mui/monorepo/packages/mui-docs/src'),
      '@mui-internal/api-docs-builder': path.resolve(
        __dirname,
        './node_modules/@mui/monorepo/packages/api-docs-builder',
      ),
      '@toolpad/studio-components': path.resolve(
        __dirname,
        './packages/toolpad-studio-components/src',
      ),
      '@toolpad/studio-runtime': path.resolve(__dirname, './packages/toolpad-studio-runtime/src'),
      '@toolpad/utils': path.resolve(__dirname, './packages/toolpad-utils/src'),
      '@toolpad/core': path.resolve(__dirname, './packages/toolpad-core/src'),
      docs: path.resolve(__dirname, './node_modules/@mui/monorepo/docs'),
      'docs-toolpad': path.resolve(__dirname, './docs'),
    },
    extensions: ['.js', '.ts', '.tsx', '.d.ts'],
  },
};
