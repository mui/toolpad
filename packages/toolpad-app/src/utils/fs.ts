import * as fs from 'fs/promises';

/**
 * Like `fs.readFile`, but for JSON files specifically. Will throw on malformed JSON.
 */
export async function readJsonFile(path: string): Promise<any> {
  const content = await fs.readFile(path, { encoding: 'utf-8' });
  return JSON.parse(content);
}
