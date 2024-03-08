import * as fs from 'fs/promises';
import * as path from 'path';
import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { fileReplace, fileReplaceAll, compareSameLayerFolder } from './fs';

describe('fileReplace', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await fs.mkdtemp('test-dir');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  test('can replace parts of a file', async () => {
    const filePath = path.resolve(testDir, './test.txt');
    await fs.writeFile(filePath, 'Hello World, Hello', { encoding: 'utf-8' });
    await fileReplace(filePath, 'Hello', 'Goodbye');
    const content = await fs.readFile(filePath, { encoding: 'utf-8' });
    expect(content).toEqual('Goodbye World, Hello');
  });

  test('can replace with double dollar signs', async () => {
    const filePath = path.resolve(testDir, './test.txt');
    await fs.writeFile(filePath, 'Hello World', { encoding: 'utf-8' });
    await fileReplace(filePath, 'Hello', '$$');
    const content = await fs.readFile(filePath, { encoding: 'utf-8' });
    expect(content).toEqual('$$ World');
  });
});

describe('fileReplaceAll', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await fs.mkdtemp('test-dir');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  test('can replace parts of a file', async () => {
    const filePath = path.resolve(testDir, './test.txt');
    await fs.writeFile(filePath, 'Hello World, Hello', { encoding: 'utf-8' });
    await fileReplaceAll(filePath, 'Hello', 'Goodbye');
    const content = await fs.readFile(filePath, { encoding: 'utf-8' });
    expect(content).toEqual('Goodbye World, Goodbye');
  });

  test('can replace with double dollar signs', async () => {
    const filePath = path.resolve(testDir, './test.txt');
    await fs.writeFile(filePath, 'Hello World', { encoding: 'utf-8' });
    await fileReplaceAll(filePath, 'Hello', '$$');
    const content = await fs.readFile(filePath, { encoding: 'utf-8' });
    expect(content).toEqual('$$ World');
  });
});

describe('compareFolders', () => {
  let sourceDir: string;
  let targetDir: string;
  let sourceFile: string;
  let targetFile: string;
  let testDir: string;
  beforeEach(async () => {
    testDir = await fs.mkdtemp('test-dir');
    sourceDir = path.resolve(testDir, './source');
    targetDir = path.resolve(testDir, './target');
    sourceFile = path.resolve(sourceDir, './test1.txt');
    targetFile = path.resolve(targetDir, './test2.txt');
  });
  test('test a same dir', async () => {
    await fs.mkdir(sourceDir);
    const result = (await compareSameLayerFolder(testDir, testDir)).shift();
    expect(result).toMatchObject({
      name: 'source',
      type: 'folder',
    });
  });
  test('test a different dir', async () => {
    await fs.mkdir(sourceDir);
    await fs.mkdir(targetDir);
    const result = await compareSameLayerFolder(sourceDir, targetDir);
    expect(result).length(0);
  });
  test('test a same file', async () => {
    await fs.mkdir(sourceDir);
    await fs.writeFile(sourceFile, 'Hello World', { encoding: 'utf-8' });
    const result = (await compareSameLayerFolder(sourceDir, sourceDir)).shift();
    expect(result).toMatchObject({
      name: 'test1.txt',
      type: 'file',
    });
  });

  test('test a different file', async () => {
    await fs.mkdir(sourceDir);
    await fs.writeFile(sourceFile, 'Hello World', { encoding: 'utf-8' });
    await fs.mkdir(targetDir);
    await fs.writeFile(targetFile, 'Hello World', { encoding: 'utf-8' });
    const result = await compareSameLayerFolder(sourceDir, targetDir);
    expect(result).length(0);
  });

  test('test a different layer file', async () => {
    await fs.mkdir(sourceDir);
    await fs.writeFile(sourceFile, 'Hello World', { encoding: 'utf-8' });
    const result = await compareSameLayerFolder(path.resolve(testDir), sourceDir);
    expect(result).length(0);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });
});
