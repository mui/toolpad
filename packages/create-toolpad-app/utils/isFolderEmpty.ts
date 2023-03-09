// From https://github.com/vercel/next.js/blob/canary/packages/create-next-app/helpers/is-folder-empty.ts
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export function isFolderEmpty(root: string, name: string): boolean {
  const validFiles = [
    '.DS_Store',
    '.git',
    '.gitattributes',
    '.gitignore',
    '.gitlab-ci.yml',
    '.hg',
    '.hgcheck',
    '.hgignore',
    '.idea',
    '.npmignore',
    '.travis.yml',
    'LICENSE',
    'Thumbs.db',
    'docs',
    'mkdocs.yml',
    'npm-debug.log',
    'yarn-debug.log',
    'yarn-error.log',
    'yarnrc.yml',
    '.yarn',
  ];

  const conflicts = fs
    .readdirSync(root)
    .filter((file) => !validFiles.includes(file))
    // Support IntelliJ IDEA-based editors
    .filter((file) => !/\.iml$/.test(file));

  if (conflicts.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`The directory ${chalk.green(name)} contains files that could conflict:`);
    // eslint-disable-next-line no-console
    console.log();
    for (const file of conflicts) {
      try {
        const stats = fs.lstatSync(path.join(root, file));
        if (stats.isDirectory()) {
          // eslint-disable-next-line no-console
          console.log(`  ${chalk.blue(file)}/`);
        } else {
          // eslint-disable-next-line no-console
          console.log(`  ${file}`);
        }
      } catch {
        // eslint-disable-next-line no-console
        console.log(`  ${file}`);
      }
    }
    // eslint-disable-next-line no-console
    console.log();
    // eslint-disable-next-line no-console
    console.log('Either try using a new directory name, or remove the files listed above.');
    // eslint-disable-next-line no-console
    console.log();
    return false;
  }

  return true;
}
