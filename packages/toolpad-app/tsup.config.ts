import * as fs from 'fs/promises';
import path from 'path';
import { defineConfig, Options } from 'tsup';

type EsbuildPlugin = NonNullable<Options['esbuildPlugins']>[number];

function cleanFolderOnFailure(folder: string): EsbuildPlugin {
  return {
    name: 'clean-dist-on-failure',
    setup(build) {
      build.onEnd(async (result) => {
        if (result.errors.length > 0) {
          await fs.rm(folder, { recursive: true, force: true });
        }
      });
    },
  };
}

export default defineConfig([
  {
    entry: {
      index: './cli/index.ts',
      appServer: './cli/appServer.ts',
      appBuilder: './cli/appBuilder.ts',
      functionsDevWorker: './src/server/functionsDevWorker.ts',
      functionsTypesWorker: './src/server/functionsTypesWorker.ts',
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
    sourcemap: true,
    esbuildPlugins: [cleanFolderOnFailure(path.resolve(__dirname, './dist/cli'))],
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
    sourcemap: true,
    target: 'es6',
    format: 'iife',
    replaceNodeEnv: true,
    esbuildPlugins: [cleanFolderOnFailure(path.resolve(__dirname, './public/reactDevtools'))],
    async onSuccess() {
      // eslint-disable-next-line no-console
      console.log('reactDevtools: build successful');
    },
  },
  {
    entry: ['src/exports/*.ts', 'src/exports/*.tsx'],
    format: ['esm', 'cjs'],
    dts: true,
    silent: true,
    outDir: 'dist/exports',
    tsconfig: './tsconfig.runtime.json',
    sourcemap: true,
    esbuildPlugins: [cleanFolderOnFailure(path.resolve(__dirname, 'dist/runtime'))],
    async onSuccess() {
      // eslint-disable-next-line no-console
      console.log('runtime: build successful');
    },
  },
]);
