import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts'],
  silent: true,
  noExternal: ['chalk', 'execa'],
  clean: true,
  async onSuccess() {
    // eslint-disable-next-line no-console
    console.log('cli: build successful');
  },
});
