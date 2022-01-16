#!/usr/bin/node
import { install } from 'esinstall';
import * as path from 'path';
import * as url from 'url';
import arg from 'arg';

const args = arg({
  // Types
  '--dev': Boolean,
});

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

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
    cwd: path.resolve(dirname, '..'),
    dest: './public/web_modules/',
    // logger: console,
    packageLookupFields: ['module', 'main'],
    env: {
      NODE_ENV: args['--dev'] ? 'development' : 'production',
    },
  },
);

console.log(stats);
