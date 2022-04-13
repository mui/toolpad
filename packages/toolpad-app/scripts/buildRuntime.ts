import * as path from 'path';
import { build } from 'esbuild';
import arg from 'arg';
import rimraf from './rimraf';

const args = arg({
  '--watch': Boolean,
});

async function main() {
  const absWorkingDir = path.resolve(__dirname, '..');
  const outdir = './public/runtime';

  await rimraf(path.resolve(absWorkingDir, outdir));

  // TODO: we can use meta to generate preload tags to speed up module loading in th runtime
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const meta = await build({
    absWorkingDir,
    bundle: true,
    outdir,
    splitting: true,
    format: 'esm',
    target: 'es2017',
    platform: 'browser',
    mainFields: ['module', 'main'],
    metafile: true,

    watch: args['--watch'],

    external: [
      'es-module-shims',
      'react',
      'react-dom',
      'react-query',
      '@mui/x-data-grid-pro',
      '@mui/material',
      '@mui/icons-material',
    ],
    entryPoints: [
      './runtime/canvas',
      './runtime/components',
      './runtime/core',
      './runtime/coreRuntime',
    ],
    logLevel: 'info',
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
