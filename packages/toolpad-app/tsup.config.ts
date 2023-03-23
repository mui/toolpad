import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'cli/index': './cli/index.ts',
  },
  silent: true,
  tsconfig: 'tsconfig.cli.json',
  noExternal: ['open-editor', 'execa', 'fractional-indexing'],
  async onSuccess() {
    // eslint-disable-next-line no-console
    console.log('build successful');
  },
});
