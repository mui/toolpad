import { spawnSync } from 'child_process';
import * as fs from 'fs/promises';
import path from 'path';
import { defineConfig, Options } from 'tsup';

type EsbuildPlugin = NonNullable<Options['esbuildPlugins']>[number];

const TOOLPAD_BUNDLED_MUI_X_LICENSE =
  'f359d9c0d105599a7d83c3f8d775eca5Tz0xMjMsRT0yNTI0NjA0NDAwMDAwLFM9cHJlbWl1bSxMTT1wZXJwZXR1YWwsS1Y9Mg==';

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
  entry: ['src/*{.ts,.tsx}'],
  format: ['esm'],
  dts: false,
  silent: true,
  clean: !options.watch,
  sourcemap: true,
  env: {
    TOOLPAD_BUNDLED_MUI_X_LICENSE,
  },
  esbuildPlugins: [cleanFolderOnFailure(path.resolve(__dirname, 'dist'))],
  async onSuccess() {
    // eslint-disable-next-line no-console
    console.log('build successful');
    spawnSync('tsc', ['--emitDeclarationOnly', '--declaration'], { shell: true, stdio: 'inherit' });
  },
}));
