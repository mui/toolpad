const path = require('path');

module.exports = {
  context: path.resolve(__dirname),
  resolve: {
    modules: [__dirname, 'node_modules'],
    alias: {
      '@mui/docs': path.resolve(__dirname, './node_modules/@mui/monorepo/packages/mui-docs/src'),
      '@mui/toolpad-components': path.resolve(__dirname, './packages/toolpad-components/src'),
      '@mui/toolpad-core': path.resolve(__dirname, './packages/toolpad-core/src'),
      '@mui/toolpad-utils': path.resolve(__dirname, './packages/toolpad-utils/src'),
      docs: path.resolve(__dirname, './node_modules/@mui/monorepo/docs'),
    },
    extensions: ['.js', '.ts', '.tsx', '.d.ts'],
  },
};
