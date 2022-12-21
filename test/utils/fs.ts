import * as fs from 'fs/promises';

export async function readJsonFile(
  path: string,
  reviver?: (this: any, key: string, value: any) => any,
): Promise<any> {
  const content = await fs.readFile(path, { encoding: 'utf-8' });
  return JSON.parse(content, reviver);
}
