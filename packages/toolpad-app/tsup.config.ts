import { spawnSync } from 'child_process';
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: './cli/index.ts',
      server: './cli/server.ts',
      appServer: './cli/appServer.ts',
      appBuilder: './cli/appBuilder.ts',
    },
    outDir: 'dist/cli',
    silent: true,
    noExternal: [
      'open-editor',
      'execa',
      'fractional-indexing',
      'lodash-es',
      'chalk',
      'get-port',
      'pretty-bytes',
      'latest-version',
      'nanoid',
    ],
    clean: true,
    sourcemap: true,
    async onSuccess() {
      // eslint-disable-next-line no-console
      console.log('cli: build successful');
    },
  },
  {
    entry: ['./reactDevtools/bootstrap.ts'],
    silent: true,
    outDir: './public/reactDevtools',
    bundle: true,
    target: 'es6',
    format: 'iife',
    replaceNodeEnv: true,
    clean: true,
    async onSuccess() {
      // eslint-disable-next-line no-console
      console.log('reactDevtools: build successful');
    },
  },
  {
    entry: {
      index: './src/runtime/entrypoint.tsx',
      canvas: './src/canvas/index.tsx',
    },
    format: ['esm', 'cjs'],
    dts: false,
    silent: true,
    outDir: 'dist/runtime',
    tsconfig: './tsconfig.esbuild.json',
    clean: true,
    async onSuccess() {
      // eslint-disable-next-line no-console
      console.log('runtime: build successful');
      spawnSync('tsc', ['--emitDeclarationOnly', '--declaration']);
    },
  },
]);
