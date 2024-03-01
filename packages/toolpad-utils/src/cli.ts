import os from 'os';
import path from 'path';

// https://www.gnu.org/software/bash/manual/html_node/Tilde-Expansion.html
export function bashResolvePath(pathName: string) {
  return pathName.startsWith('~/')
    ? path.resolve(os.homedir(), pathName.slice(2))
    : path.resolve(process.cwd(), pathName);
}
