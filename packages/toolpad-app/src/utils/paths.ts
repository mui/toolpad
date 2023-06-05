import * as path from 'path';

/**
 * Converts a file path to a node import specifier.
 */
export function pathToNodeImportSpecifier(importPath: string): string {
  const normalized = path.normalize(importPath).split(path.sep).join('/');
  return normalized.startsWith('/') ? normalized : `./${normalized}`;
}
