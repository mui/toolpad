import { spawnSync } from 'child_process';
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
  dts: false,
  silent: true,
  sourcemap: true,
  splitting: true,
  esbuildPlugins: [cleanFolderOnFailure(path.resolve(__dirname, 'dist'))],
  async onSuccess() {
    spawnSync('tsc', ['--emitDeclarationOnly', '--declaration'], { shell: true });
    // eslint-disable-next-line no-console
    console.log('build successful');
  },
});
