import { parse } from 'url';
import next from 'next';
import express from 'express';
import invariant from 'invariant';
import { createServer } from 'http';
import { createHandler } from '../src/server/toolpadAppServer';
import { getUserProjectRoot } from '../src/server/localMode';

async function main() {
  const { default: chalk } = await import('chalk');

  const app = express();
  const httpServer = createServer(app);

  const previewApp = await createHandler({
    server: httpServer,
    root: getUserProjectRoot(),
    base: '/preview',
    canvas: false,
  });
  app.use('/preview', previewApp);

  const canvasApp = await createHandler({
    server: httpServer,
    root: getUserProjectRoot(),
    base: '/app-canvas',
    canvas: true,
  });
  app.use('/app-canvas', canvasApp);

  const projectDir = process.env.TOOLPAD_PROJECT_DIR;
  const dir = process.env.TOOLPAD_DIR;
  const dev = process.env.NODE_ENV !== 'production';
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
