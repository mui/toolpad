import path from 'path';
import url from 'url';

const currentDirectory = url.fileURLToPath(new URL('.', String(import.meta.url)));

export default {
  'toolpad-core': {
    rootPath: path.join(currentDirectory, '../packages/toolpad-core'),
    entryPointPath: 'src/index.ts',
  },
  docs: {
    rootPath: path.join(currentDirectory, '../docs'),
    tsConfigPath: 'tsconfig.json',
  },
};
