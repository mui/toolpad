import { spawnSync } from 'child_process';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/*.ts', 'src/*.tsx'],
  format: ['esm', 'cjs'],
  dts: false,
  async onSuccess() {
    spawnSync('tsc', ['--emitDeclarationOnly', '--declaration']);
  },
});
