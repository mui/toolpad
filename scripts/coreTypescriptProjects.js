import path from 'path';

export default {
  'toolpad-core': {
    rootPath: path.join(process.cwd(), 'packages/toolpad-core'),
    entryPointPath: 'src/index.ts',
  },
  docs: {
    rootPath: path.join(process.cwd(), 'docs'),
    tsConfigPath: 'tsconfig.json',
  },
};