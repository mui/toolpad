import * as fs from 'fs/promises';
import * as path from 'path';
import { Dirent } from 'fs';
import * as yaml from 'yaml';
import { yamlOverwrite } from 'yaml-diff-patch';
import { errorFrom } from './errors';

export type Reviver = NonNullable<Parameters<typeof JSON.parse>[1]>;

/**
 * Like `fs.readFile`, but for JSON files specifically. Will throw on malformed JSON.
 */
export async function readJsonFile(filePath: string, reviver?: Reviver): Promise<unknown> {
  const content = await fs.readFile(filePath, { encoding: 'utf-8' });
  return JSON.parse(content, reviver);
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

export async function readMaybeDir(dirPath: string): Promise<Dirent[] | null> {
  try {
    return await fs.readdir(dirPath, { withFileTypes: true });
  } catch (rawError: unknown) {
    const error = errorFrom(rawError);
    if (errorFrom(error).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export type WriteFileOptions = Parameters<typeof fs.writeFile>[2];

export async function writeFileRecursive(
  filePath: string,
  content: string | Buffer,
  options?: WriteFileOptions,
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, options);
}

export async function updateYamlFile(
  filePath: string,
  content: object,
  callback?: (content: string) => string,
) {
  const oldContent = await readMaybeFile(filePath);
  const newContent = oldContent ? yamlOverwrite(oldContent, content) : yaml.stringify(content);

  if (newContent !== oldContent) {
    await writeFileRecursive(filePath, callback ? callback(newContent) : newContent);
  }
}

export async function fileExists(filepath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filepath);
    return stat.isFile();
  } catch (err) {
    if (errorFrom(err).code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

export async function folderExists(folderpath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(folderpath);
    return stat.isDirectory();
  } catch (err) {
    if (errorFrom(err).code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

export async function fileReplace(
  filePath: string,
  searchValue: string | RegExp,
  replaceValue: string,
): Promise<void> {
  const queriesFileContent = await fs.readFile(filePath, { encoding: 'utf-8' });
  const updatedFileContent = queriesFileContent.replace(searchValue, () => replaceValue);
  await fs.writeFile(filePath, updatedFileContent);
}

export async function fileReplaceAll(
  filePath: string,
  searchValue: string | RegExp,
  replaceValue: string,
) {
  const queriesFileContent = await fs.readFile(filePath, { encoding: 'utf-8' });
  const updatedFileContent = queriesFileContent.replaceAll(searchValue, () => replaceValue);
  await fs.writeFile(filePath, updatedFileContent);
}
