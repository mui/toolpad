const { spawn, exec } = require('child_process');
const fs = require('fs');
const { rimraf } = require('rimraf');
const http = require('http');

interface ServerResponse {
  statusCode: number;
}

describe('create-toolpad-app', () => {
  let toolpadProcess: ReturnType<typeof exec>;
  let cp: ReturnType<typeof spawn>;
  let toolpadAppAddress = '';
  const toolpadAppAddressRegex = /http:\/\/localhost:(\d+)/;
  const directoryPath = './my-test-app';

  test('create-toolpad-app launches the app', (done) => {
    const scriptPath = './packages/create-toolpad-app/dist/index.js';
    cp = spawn('node', [scriptPath, directoryPath]);
    const { stderr } = cp;

    stderr.on('data', (data: Buffer) => {
      console.error(data.toString());
    });

    cp.on('error', (err: Error) => {
      console.error(`Failed to start create-toolpad-app: ${err}`);
    });

    cp.on('exit', (code: number | null, signal: string | null) => {
      if (code !== 0) {
        console.error(`create-toolpad-app exited with code ${code}`);
      } else if (signal !== null) {
        console.error(`create-toolpad-app exited due to signal ${signal}`);
      } else {
        toolpadProcess = exec('yarn dev', {
          cwd: directoryPath,
        });

        toolpadProcess.on('error', (err: Error) => {
          console.error(`Failed to start toolpad dev: ${err}`);
        });

        toolpadProcess.stdout.on('data', (data: Buffer) => {
          // Match the URL in a line which says "ready on <URL>":
          const matches = data.toString().match(toolpadAppAddressRegex);
          if (matches) {
            toolpadAppAddress = matches[0];
            done();
          }
        });
      }
    });
  }, 60000);

  it('should return a 200 status code when hitting the health-check route', (done) => {
    http.get(`${toolpadAppAddress}/health-check`, (res: ServerResponse) => {
      expect(res.statusCode).toBe(200);
      done();
    });
  });

  afterAll(() => {
    if (toolpadProcess) {
      toolpadProcess.kill();
    }

    toolpadProcess.on('exit', () => {
      if (fs.existsSync(directoryPath)) {
        rimraf(directoryPath);
      }
    });
  });
});
