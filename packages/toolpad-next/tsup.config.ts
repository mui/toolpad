import { defineConfig } from 'tsup';
import * as fs from 'fs/promises';
import path from 'path';
import type * as esbuild from 'esbuild';

function cleanFolderOnFailure(folder: string): esbuild.Plugin {
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
]);
