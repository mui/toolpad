import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/*.ts', 'src/*.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
});
