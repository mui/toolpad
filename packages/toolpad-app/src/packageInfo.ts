import * as path from 'path';
import * as url from 'node:url';
import * as fs from 'fs';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const pkgJsonContent = fs.readFileSync(path.resolve(currentDirectory, '../../package.json'), {
  encoding: 'utf-8',
});
const pkgJson = JSON.parse(pkgJsonContent);

export interface PackageInfo {
  version: string;
  build: string;
}

// https://vitejs.dev/config/
export default {
  version: pkgJson.version,
  build: process.env.GIT_SHA1?.slice(0, 7) || 'dev',
} satisfies PackageInfo;
