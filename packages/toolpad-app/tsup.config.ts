import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'cli/index': './cli/index.ts',
  },
  tsconfig: 'tsconfig.cli.json',
  noExternal: ['open-editor', 'execa', 'fractional-indexing'],
});
