import * as fs from 'fs/promises';

export type Reviver = NonNullable<Parameters<typeof JSON.parse>[1]>;

export async function readJsonFile(path: string, reviver?: Reviver): Promise<any> {
  const content = await fs.readFile(path, { encoding: 'utf-8' });
  return JSON.parse(content, reviver);
}

export async function fileReplace(
  filePath: string,
  searchValue: string | RegExp,
  replaceValue: string,
): Promise<void> {
  const queriesFileContent = await fs.readFile(filePath, { encoding: 'utf-8' });
  const updatedFileContent = queriesFileContent.replace(searchValue, replaceValue);
  await fs.writeFile(filePath, updatedFileContent);
}

export async function fileReplaceAll(
  filePath: string,
  searchValue: string | RegExp,
  replaceValue: string,
) {
  const queriesFileContent = await fs.readFile(filePath, { encoding: 'utf-8' });
  const updatedFileContent = queriesFileContent.replaceAll(searchValue, replaceValue);
  await fs.writeFile(filePath, updatedFileContent);
}
