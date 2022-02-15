import * as fs from 'fs/promises';
import * as path from 'path';
import globCb from 'glob';
import { promisify } from 'util';

const glob = promisify(globCb);

const LIBS = [
  'react',
  'react-dom',
  '@mui/material',
  // TODO: we need to analyze imports of the definition files and include those libs automatically
  'csstype',
  'react-transition-group',
  '@mui/base',
  '@mui/styles',
  '@mui/types',
  '@mui/system',
  '@mui/utils',
  '@mui/studio-core',
];

async function getDefinitions() {
  const allFiles: string[] = (
    await Promise.all(
      LIBS.map(async (lib) => {
        const files: string[] = [];
        const resolvedPkg = require.resolve(`${lib}/package.json`);
        let dtsFiles = await glob('**/*.d.ts', {
          cwd: path.dirname(resolvedPkg),
          absolute: true,
        });
        if (lib === '@mui/material') {
          dtsFiles = dtsFiles.map((fileName) => fileName.replace('/dist/', '/'));
          console.log(resolvedPkg, dtsFiles);
        }
        if (dtsFiles.length > 0) {
          files.push(resolvedPkg, ...dtsFiles);
        }

        try {
          let typesLib = lib;
          if (lib.startsWith('@')) {
            const [part1, part2] = lib.slice(1).split('/');
            typesLib = `${part1}__${part2}`;
          }
          const resolvedTypesPkg = require.resolve(`@types/${typesLib}/package.json`);
          const typesDtsFiles = await glob('**/*.d.ts', {
            cwd: path.dirname(resolvedTypesPkg),
            absolute: true,
          });
          if (typesDtsFiles.length > 0) {
            files.push(resolvedTypesPkg, ...typesDtsFiles);
          }
          // eslint-disable-next-line no-empty
        } catch (err) {}

        return files;
      }),
    )
  ).flat();

  const root = path.resolve(__dirname, '../../..');

  const result: Record<string, string> = Object.assign(
    {},
    ...(await Promise.all(
      allFiles.map(async (file) => {
        const relative = path.relative(root, file);
        return { [relative]: await fs.readFile(file, { encoding: 'utf-8' }) };
      }),
    )),
  );

  await fs.writeFile(path.resolve(__dirname, '../public/typings.json'), JSON.stringify(result), {
    encoding: 'utf-8',
  });
}

getDefinitions();
