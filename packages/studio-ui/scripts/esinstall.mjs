#!/usr/bin/node
import { install } from 'esinstall';
import * as path from 'path';
import * as url from 'url';

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

const { stats } = await install(
  [
    'es-module-shims',
    'react',
    'react-dom',
    '@mui/studio-core',
    '@mui/studio-components',
    '@mui/x-data-grid',
    '@mui/material',
    '@mui/material/styles',
    '@mui/material/colors',
    '@mui/material/Container',
    '@mui/material/Stack',
    '@mui/material/Paper',
    '@mui/material/Button',
    '@mui/material/TextField',
  ],
  {
    cwd: path.resolve(dirname, '..'),
    dest: './public/web_modules/',
    // logger: console,
    packageLookupFields: ['module', 'main'],
    env: {
      NODE_ENV: 'production',
    },
  },
);

console.log(stats);
