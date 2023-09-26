import { homedir } from 'os';
import path from 'path';

// it's convenient for test
export function getAbsoluteUrl(pathName: string) {
  return pathName.startsWith('~')
    ? path.resolve(homedir(), pathName.slice(2))
    : path.resolve(process.cwd(), pathName);
}
