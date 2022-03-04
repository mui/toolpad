#!/usr/bin/node
import { install } from 'esinstall';
import * as path from 'path';
import arg from 'arg';
import rimrafCb from 'rimraf';
import { promisify } from 'util';

const rimraf = promisify(rimrafCb);

const args = arg({
  // Types
  '--dev': Boolean,
});

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEST = './public/web_modules/';

async function main() {
  console.log('installing...');

  await rimraf(path.resolve(PROJECT_ROOT, DEST));

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
      '@mui/lab',
    ],
    {
      cwd: PROJECT_ROOT,
      dest: DEST,
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
