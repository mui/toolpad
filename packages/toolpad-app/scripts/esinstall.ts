#!/usr/bin/node
import { install } from 'esinstall';
import * as path from 'path';
import arg from 'arg';
import rimraf from './rimraf';

const args = arg({
  // Types
  '--dev': Boolean,
});

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEST = './public/web_modules/';

async function main() {
  console.log('installing /public/web_modules...');

  await rimraf(path.resolve(PROJECT_ROOT, DEST));

  const { stats } = await install(
    [
      'es-module-shims',
      'react',
      'react/jsx-runtime',
      'react-dom',
      'react-dom/client',
      'react-query',
      'react-router-dom',
      '@mui/x-data-grid-pro',
      '@mui/material',
      '@mui/material/utils',
      // '@mui/material/styles',
      '@mui/material/colors',
      '@mui/lab',
      '@mui/icons-material/Error',
      'quickjs-emscripten',
    ],
    {
      cwd: PROJECT_ROOT,
      dest: DEST,
      polyfillNode: true,
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
