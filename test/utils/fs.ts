import * as fs from 'fs/promises';

export type Reviver = NonNullable<Parameters<typeof JSON.parse>[1]>;

export async function readJsonFile(path: string, reviver?: Reviver): Promise<any> {
  const content = await fs.readFile(path, { encoding: 'utf-8' });
  return JSON.parse(content, reviver);
}
