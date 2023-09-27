import { homedir } from 'os';
import path from 'path';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];

export function getExtension(filePath: string): string {
  const fileName = filePath.split('/').pop() || '';
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex < 0 ? '' : fileName.substring(dotIndex);
}

export function hasImageExtension(pathName: string): boolean {
  const extension = getExtension(pathName);
  return IMAGE_EXTENSIONS.includes(extension);
}

// https://www.gnu.org/software/bash/manual/html_node/Tilde-Expansion.html
export function bashResolvePath(pathName: string) {
  return pathName.startsWith('~/')
    ? path.resolve(homedir(), pathName.slice(2))
    : path.resolve(process.cwd(), pathName);
}
