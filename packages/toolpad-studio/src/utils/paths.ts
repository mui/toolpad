import * as path from 'path';

/**
 * Normalize a file path to POSIX in order for it to be platform-agnostic.
 */
export function toPosixPath(importPath: string): string {
  return path.normalize(importPath).split(path.sep).join(path.posix.sep);
}

/**
 * Converts a file path to a node import specifier.
 */
export function pathToNodeImportSpecifier(importPath: string): string {
  const normalized = toPosixPath(importPath);
  return normalized.startsWith('/') || normalized.startsWith('.') ? normalized : `./${normalized}`;
}
