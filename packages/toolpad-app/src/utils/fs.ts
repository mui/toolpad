import * as fs from 'fs/promises';
import * as path from 'path';
import { errorFrom } from './errors';

/**
 * Like `fs.readFile`, but for JSON files specifically. Will throw on malformed JSON.
 */
export async function readJsonFile(filePath: string): Promise<any> {
  const content = await fs.readFile(filePath, { encoding: 'utf-8' });
  return JSON.parse(content);
}

export async function readMaybeFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, { encoding: 'utf-8' });
  } catch (rawError) {
    const error = errorFrom(rawError);
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export type WriteFileOptions = Parameters<typeof fs.writeFile>[2];

export async function writeFileRecursive(
  filePath: string,
  content: string | Buffer,
  options: WriteFileOptions,
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, options);
}
