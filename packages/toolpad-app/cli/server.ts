import { parse } from 'url';
import next from 'next';
import * as path from 'path';
import express from 'express';
import invariant from 'invariant';
import { createServer } from 'http';
import { execaNode } from 'execa';
import getPort from 'get-port';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createProdHandler } from '../src/server/toolpadAppServer';
import { getUserProjectRoot } from '../src/server/localMode';
import { listen } from '../src/utils/http';
import { getProject } from '../src/server/liveProject';
import { Command as AppDevServerCommand, Event as AppDevServerEvent } from './appServer';

async function main() {
  const { default: chalk } = await import('chalk');

  const app = express();
  const httpServer = createServer(app);

  const cmd = process.env.TOOLPAD_CMD;

  switch (cmd) {
    case 'dev': {
      const projectDir = getUserProjectRoot();

      const appServerPath = path.resolve(__dirname, './appServer.js');
      const devPort = await getPort();
      const project = await getProject();

      const cp = execaNode(appServerPath, [], {
        cwd: projectDir,
        stdio: 'inherit',
        env: {
          NODE_ENV: 'development',
          TOOLPAD_PROJECT_DIR: projectDir,
          TOOLPAD_PORT: String(devPort),
          FORCE_COLOR: '1',
        },
      });

      await new Promise<void>((resolve, reject) => {
        cp.on('message', (msg: AppDevServerEvent) => {
          if (msg.kind === 'ready') {
            resolve();
          }
        });

        cp.once('exit', () => {
          reject(new Error('Failed to start dev server'));
        });
      });

      project.events.on('componentsListChanged', () => {
        cp.send({ kind: 'reload-components' } satisfies AppDevServerCommand);
      });

      app.use(
        '/preview',
        createProxyMiddleware({
          logLevel: 'silent',
          ws: true,
          target: {
            host: 'localhost',
            port: devPort,
          },
        }),
      );
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

  await listen(httpServer, port);

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
