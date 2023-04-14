import { parse } from 'url';
import next from 'next';
import express from 'express';
import invariant from 'invariant';
import { createServer } from 'http';
import { setTimeout } from 'timers/promises';
import { createDevHandler, createProdHandler } from '../src/server/toolpadAppServer';
import { getUserProjectRoot } from '../src/server/localMode';

async function main() {
  const { default: chalk } = await import('chalk');

  const app = express();
  const httpServer = createServer(app);

  const cmd = process.env.TOOLPAD_CMD;

  switch (cmd) {
    case 'dev': {
      const previewApp = await createDevHandler({
        server: httpServer,
        root: getUserProjectRoot(),
        base: '/preview',
      });
      app.use('/preview', previewApp);
      break;
    }
    case 'start': {
      const prodHandler = await createProdHandler({
        server: httpServer,
        root: getUserProjectRoot(),
        base: '/prod',
      });
      app.use('/prod', prodHandler);
      break;
    }
    default:
      throw new Error(`Unknown toolpad command ${cmd}`);
  }

  await setTimeout(1000);

  const projectDir = process.env.TOOLPAD_PROJECT_DIR;
  const dir = process.env.TOOLPAD_DIR;
  const dev = !!process.env.TOOLPAD_NEXT_DEV;
  const hostname = 'localhost';
  const port = Number(process.env.TOOLPAD_PORT);

  // when using middleware `hostname` and `port` must be provided below
  const editorNextApp = next({ dir, dev, hostname, port });
  const handle = editorNextApp.getRequestHandler();

  app.use(async (req, res) => {
    try {
      invariant(req.url, 'request must have a url');
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  await new Promise<void>((resolve, reject) => {
    httpServer
      .once('error', (err) => {
        reject(err);
      })
      .listen(port, () => {
        resolve();
      });
  });

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.green('ready')} - toolpad project ${chalk.cyan(projectDir)} ready on ${chalk.cyan(
      `http://${hostname}:${port}`,
    )}`,
  );

  await editorNextApp.prepare();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
