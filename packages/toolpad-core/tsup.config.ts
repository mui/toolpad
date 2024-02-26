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

export default defineConfig({
  entry: ['src/*{.ts,.tsx}'],
  format: ['esm'],
  experimentalDts: true,
  silent: true,
  sourcemap: true,
  splitting: true,
  esbuildPlugins: [cleanFolderOnFailure(path.resolve(__dirname, 'dist'))],
});
