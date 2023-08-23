import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { defineConfig, Options } from 'tsup';

type EsbuildPlugin = NonNullable<Options['esbuildPlugins']>[number];

export function cleanFolderOnFailure(folder: string): EsbuildPlugin {
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

const execP = promisify(exec);

export default defineConfig({
  entry: ['src/*{.ts,.tsx}'],
  format: ['esm', 'cjs'],
  dts: false,
  silent: true,
  sourcemap: true,
  esbuildPlugins: [cleanFolderOnFailure(path.resolve(__dirname, 'dist'))],
  async onSuccess() {
    // eslint-disable-next-line no-console
    console.log('build successful, generating types');
    await execP('tsc --emitDeclarationOnly --declaration');
    // eslint-disable-next-line no-console
    console.log('type generation successful');
  },
});
