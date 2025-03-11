/* eslint-disable no-console */
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  includeFileInBuild,
  createModulePackages,
  typescriptCopy,
  createPackageFile,
} from '@mui/monorepo/scripts/copyFilesUtils.mjs';

const packagePath = process.cwd();
const buildPath = path.join(packagePath, './build');
const srcPath = path.join(packagePath, './src');

async function prepend(file, string) {
  const data = await fs.readFile(file, 'utf8');
  await fs.writeFile(file, string + data, 'utf8');
}

async function addLicense(packageData) {
  const license = `/**
 * ${packageData.name} v${packageData.version}
 *
 * @license ${packageData.license}
 * This source code is licensed under the ${packageData.license} license found in the
 * LICENSE file in the root directory of this source tree.
 */
`;
  await Promise.all(
    [
      './index.js',
      './legacy/index.js',
      './modern/index.js',
      './esm/index.js',
      './node/index.js',
    ].map(async (file) => {
      try {
        await prepend(path.resolve(buildPath, file), license);
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.log(`Skipped license for ${file}`);
        } else {
          throw err;
        }
      }
    }),
  );
}

async function run() {
  const args = process.argv.slice(2);
  const extraFiles = args.filter((arg) => !arg.startsWith('--'));
  const useExports = args.includes('--use-exports');
  try {
    const packageData = await createPackageFile(useExports);

    await Promise.all(
      ['./README.md', '../../CHANGELOG.md', '../../LICENSE', ...extraFiles].map((file) =>
        includeFileInBuild(file),
      ),
    );

    await addLicense(packageData);

    if (!useExports) {
      // TypeScript
      await typescriptCopy({ from: srcPath, to: buildPath });

      await createModulePackages({ from: srcPath, to: buildPath });
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
