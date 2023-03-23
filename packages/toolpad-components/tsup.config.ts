import { spawnSync } from 'child_process';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/*.ts', 'src/*.tsx'],
  format: ['esm', 'cjs'],
  dts: false,
  silent: true,
  esbuildOptions: (options) => {
    // jest can't handle untranspiled import()
    // https://github.com/evanw/esbuild/issues/2966
    options.supported ??= {};
    options.supported['dynamic-import'] = false;

    return options;
  },
  async onSuccess() {
    // eslint-disable-next-line no-console
    console.log('build successful');
    spawnSync('tsc', ['--emitDeclarationOnly', '--declaration']);
  },
});
