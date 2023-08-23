import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { defineConfig } from 'tsup';
import { cleanFolderOnFailure } from '../toolpad-utils/src/tsup';

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
