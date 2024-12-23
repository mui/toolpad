import path from 'path';
import fs from 'fs';

const repositoryRoot = path.resolve(__dirname, '../../../..');

function findMatchingFileName(directory: string, name: string) {
  const files = fs.readdirSync(directory);
  const matchingFile = files.find((file) => file.endsWith(name));
  return matchingFile ? matchingFile.replace(/\.[^/.]+$/, '') : null; // Remove the extension
}

export function getComponentImports(name: string, filename: string) {
  const relativePath = path.relative(repositoryRoot, filename);
  const directories = path.dirname(relativePath).split(path.sep);
  if (
    directories[0] !== 'packages' ||
    directories[1] !== 'toolpad-core' ||
    directories[2] !== 'src'
  ) {
    throw new Error(`The file ${filename} is not in the Toolpad Core package`);
  }

  if (directories.length < 4) {
    throw new Error(`The file ${filename} is not in a subdirectory of packages/toolpad-core/src`);
  }

  const componentDirectory = directories[3];
  if (componentDirectory === name) {
    const nextjsRelativePath = path.resolve(relativePath, '../../nextjs');
    const nextjsFileName = findMatchingFileName(nextjsRelativePath, `${name}.tsx`);

    const reactRouterRelativePath = path.resolve(relativePath, '../../react-router');
    const reactRouterFileName = findMatchingFileName(reactRouterRelativePath, `${name}.tsx`);

    return [
      `import { ${name} } from '@toolpad/core/${name}';`,
      `import { ${name} } from '@toolpad/core';${
        nextjsFileName
          ? `\nimport { ${nextjsFileName} } from '@toolpad/core/nextjs'; // Next.js`
          : ''
      }${
        reactRouterFileName
          ? `\nimport { ${reactRouterFileName} } from '@toolpad/core/react-router'; // React Router`
          : ''
      }`,
    ];
  }

  return [`import { ${name} } from '@toolpad/core/${componentDirectory}';`];
}
