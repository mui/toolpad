#!/usr/bin/node
import { install } from 'esinstall';
import * as path from 'path';
import arg from 'arg';

const args = arg({
  // Types
  '--dev': Boolean,
});

console.log('installing...');

async function main() {
  const { stats } = await install(
    [
      'es-module-shims',
      'react',
      'react-dom',
      'react-query',
      '@mui/studio-core',
      '@mui/studio-core/runtime',
      '@mui/studio-components',
      '@mui/x-data-grid-pro',
      '@mui/material',
      '@mui/material/utils',
      '@mui/material/styles',
      '@mui/material/colors',
    ],
    {
      cwd: path.resolve(__dirname, '..'),
      dest: './public/web_modules/',
      // logger: console,
      packageLookupFields: ['module', 'main'],
      env: {
        NODE_ENV: args['--dev'] ? 'development' : 'production',
      },
    },
  );

  console.log(stats);
}

main();
