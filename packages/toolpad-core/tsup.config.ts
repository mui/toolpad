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

const getBaseConfig = (): Options => ({
  format: ['esm'],
  dts: true,
  silent: true,
  clean: true,
  sourcemap: true,
});

export default defineConfig(() => [
  {
    entry: ['src/index.ts', 'src/AppProvider/index.ts'],
    ...getBaseConfig(),
    esbuildPlugins: [cleanFolderOnFailure(path.resolve(__dirname, 'dist'))],
    async onSuccess() {
      // eslint-disable-next-line no-console
      console.log('main: build successful');
    },
  },
  {
    entry: ['src/layout/index.ts'],
    ...getBaseConfig(),
    outDir: 'dist/layout',
    esbuildPlugins: [cleanFolderOnFailure(path.resolve(__dirname, 'dist/layout'))],
    esbuildOptions(buildOptions) {
      buildOptions.banner = {
        js: '"use client";',
      };
    },
    async onSuccess() {
      // eslint-disable-next-line no-console
      console.log('layout: build successful');
    },
  },
]);
