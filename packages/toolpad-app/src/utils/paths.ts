import * as path from 'path';

/**
 * Normalize a file path to be platform-agnostic.
 */
export function normalizePath(importPath: string): string {
  return path.normalize(importPath).split(path.sep).join('/');
}

/**
 * Converts a file path to a node import specifier.
 */
export function pathToNodeImportSpecifier(importPath: string): string {
  const normalized = normalizePath(importPath);
  return normalized.startsWith('/') ? normalized : `./${normalized}`;
}
