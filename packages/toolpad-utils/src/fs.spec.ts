import * as fs from 'fs/promises';
import * as path from 'path';
import { describe, test, beforeEach, afterEach, expect } from '@jest/globals';
import { fileReplace, fileReplaceAll } from './fs';

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
