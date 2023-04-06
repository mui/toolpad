import { spawnSync } from 'child_process';
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      'cli/index': './cli/index.ts',
      'cli/server': './cli/server.ts',
    },
    silent: true,
    noExternal: ['open-editor', 'execa', 'fractional-indexing'],
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
    async onSuccess() {
      // eslint-disable-next-line no-console
      console.log('reactDevtools: build successful');
    },
  },
  {
    entry: {
      runtime: './src/runtime/entrypoint.tsx',
    },
    format: ['esm', 'cjs'],
    dts: false,
    silent: true,
    tsconfig: './tsconfig.esbuild.json',
    async onSuccess() {
      // eslint-disable-next-line no-console
      console.log('runtime: build successful');
      spawnSync('tsc', ['--emitDeclarationOnly', '--declaration']);
    },
  },
]);
