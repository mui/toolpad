import * as fs from 'fs/promises';
import path from 'path';
import { spawnSync } from 'child_process';
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

export default defineConfig((options) => ({
  entry: [
    'src/*{.ts,.tsx}',
    '!src/**/*.spec.*', // Avoid building tests
  ],
  format: ['esm', 'cjs'],
  dts: false,
  silent: true,
  clean: !options.watch,
  sourcemap: true,
  esbuildPlugins: [cleanFolderOnFailure(path.resolve(__dirname, 'dist'))],
  async onSuccess() {
    // eslint-disable-next-line no-console
    console.log('build successful');
    spawnSync('tsc', ['--emitDeclarationOnly', '--declaration'], { shell: true });
  },
}));
