import path from 'path';
import { defineConfig } from 'tsup';
import { cleanFolderOnFailure, generateTypes } from '../toolpad-utils/src/tsup';

export default defineConfig({
  entry: ['src/*{.ts,.tsx}'],
  format: ['esm', 'cjs'],
  dts: false,
  silent: true,
  sourcemap: true,
  esbuildPlugins: [cleanFolderOnFailure(path.resolve(__dirname, 'dist'))],
  async onSuccess() {
    await generateTypes();
  },
});
