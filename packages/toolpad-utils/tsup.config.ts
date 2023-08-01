import * as fs from 'fs/promises';
import path from 'path';
import { spawnSync } from 'child_process';
import type * as esbuild from 'esbuild';
import { defineConfig } from 'tsup';

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

export default defineConfig({
  entry: [
    'src/*{.ts,.tsx}',
    'src/hooks/*{.ts,.tsx}',
    '!src/**/*.spec.*', // Avoid building tests
  ],
  format: ['esm', 'cjs'],
  dts: false,
  silent: true,
  sourcemap: true,
  esbuildPlugins: [cleanFolderOnFailure(path.resolve(__dirname, 'dist'))],
  async onSuccess() {
    // eslint-disable-next-line no-console
    console.log('build successful');
    spawnSync('tsc', ['--emitDeclarationOnly', '--declaration'], { shell: true });
  },
});
