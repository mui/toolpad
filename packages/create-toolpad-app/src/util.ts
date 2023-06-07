import * as fs from 'fs/promises';

export async function readJsonFile(filePath: string): Promise<any> {
  const content = await fs.readFile(filePath, { encoding: 'utf-8' });
  return JSON.parse(content);
}
