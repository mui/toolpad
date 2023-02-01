// TODO: Create a @mui/toolpad-utils package to house utilities like this one?

import { IMAGE_EXTENSIONS } from './constants.js';

export function getExtension(path: string): string {
  const splitPath = path.split('.');
  return splitPath[splitPath.length - 1];
}

export function hasImageExtension(path: string): boolean {
  const extension = getExtension(path);
  return IMAGE_EXTENSIONS.includes(extension);
}
