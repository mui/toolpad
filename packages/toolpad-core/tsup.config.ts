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

const getBaseConfig = (options: Options): Options => ({
  format: ['esm'],
  dts: true,
  silent: true,
  clean: !options.watch,
  sourcemap: true,
});

export default defineConfig((options) => [
  {
    entry: ['src/index.ts', 'src/AppProvider/index.ts'],
    ...getBaseConfig(options),
    esbuildPlugins: [cleanFolderOnFailure(path.resolve(__dirname, 'dist'))],
    async onSuccess() {
      // eslint-disable-next-line no-console
      console.log('main: build successful');
    },
  },
  {
    entry: ['src/layout/index.ts'],
    ...getBaseConfig(options),
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
