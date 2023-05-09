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
let toolpadProcess: ExecaChildProcess<string> | undefined;

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
  toolpadProcess = execa('yarn', ['dev'], {
    cwd: testDir,
  });
  const { stdout: toolpadStream } = toolpadProcess;
  if (toolpadStream) {
    for await (const data of toolpadStream) {
      const output = data.toString();
      let appUrl = '';
      // Check if the output contains the desired URL
      if (output.includes('ready on')) {
        const readyRegex = /ready on (.*)/;
        const urlRegex = /http:\/\/localhost:(\d+)/;
        const match = output.match(readyRegex);

        if (match && match[1]) {
          appUrl = match[1].trim().match(urlRegex)?.[0] ?? '';
        }
      }
      // Check if the output contains the desired compilation success message
      if (appUrl) {
        try {
          // Perform the health check on the running app
          const healthCheckResponse = await (await fetch(`${appUrl}/health-check`)).json();
          expect(healthCheckResponse).toEqual(
            expect.objectContaining({
              memoryUsage: expect.any(Object),
              memoryUsagePretty: expect.any(Object),
            }),
          );
        } catch (error) {
          throw new Error(`Health check failed: ${error}`);
        } finally {
          toolpadProcess?.kill();
        }
      }
    }
  }
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
