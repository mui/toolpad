import * as fs from 'fs/promises';
import { jest } from '@jest/globals';
import * as path from 'path';
import * as url from 'url';
import { execa, ExecaChildProcess } from 'execa';

jest.setTimeout(60000);

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const cliPath = path.resolve(currentDirectory, '../dist/index.js');

let testDir: string | undefined;
let cp: ExecaChildProcess<string> | undefined;

test('create-toolpad-app can bootstrap a Toolpad app', async () => {
  testDir = await fs.mkdtemp(path.resolve(currentDirectory, './test-app-'));
  cp = execa(cliPath, [path.basename(testDir)], {
    cwd: currentDirectory,
  });
  const result = await cp;
  expect(result.stdout).toMatch('Run the following to get started');
  const packageJsonContent = await fs.readFile(path.resolve(testDir, './package.json'), {
    encoding: 'utf-8',
  });
  const packageJson = JSON.parse(packageJsonContent);
  expect(packageJson).toEqual(
    expect.objectContaining({
      dependencies: expect.objectContaining({
        '@mui/toolpad': expect.any(String),
      }),
      scripts: expect.objectContaining({
        build: 'toolpad build',
        dev: 'toolpad dev',
        start: 'toolpad start',
      }),
    }),
  );
});

afterEach(async () => {
  if (testDir) {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});

afterEach(async () => {
  if (cp) {
    cp.kill();
  }
});
