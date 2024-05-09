import path from 'path';

const repositoryRoot = path.resolve(__dirname, '../../..');

export function getComponentImports(name: string, filename: string) {
  const relativePath = path.relative(repositoryRoot, filename);
  const directories = path.dirname(relativePath).split(path.sep);
  if (
    directories[1] !== 'packages' ||
    directories[2] !== 'toolpad-core' ||
    directories[3] !== 'src'
  ) {
    throw new Error(`The file ${filename} is not in the Toolpad Core package`);
  }

  if (directories.length < 4) {
    throw new Error(`The file ${filename} is not in a subdirectory of packages/toolpad-core/src`);
  }

  const componentDirectory = directories[3];
  if (componentDirectory === name) {
    return [`import { ${name} } from '@toolpad/core/${name}';`];
  }

  if (name.startsWith(componentDirectory) && !name.startsWith('use')) {
    const childName = name.slice(componentDirectory.length);
    return [
      `import * as ${componentDirectory} from '@toolpad/core/${componentDirectory}';\nconst ${name} = ${componentDirectory}.${childName};`,
    ];
  }

  return [`import { ${name} } from '@toolpad/core/${componentDirectory}';`];
}
