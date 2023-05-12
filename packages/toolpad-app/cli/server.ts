import { parse } from 'url';
import next from 'next';
import * as path from 'path';
import express from 'express';
import invariant from 'invariant';
import { IncomingMessage, createServer } from 'http';
import { execaNode } from 'execa';
import getPort from 'get-port';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { mapValues } from '@mui/toolpad-utils/collections';
import prettyBytes from 'pretty-bytes';
import { WebSocket, WebSocketServer } from 'ws';
import { createProdHandler } from '../src/server/toolpadAppServer';
import { getUserProjectRoot } from '../src/server/localMode';
import { listen } from '../src/utils/http';
import { getProject } from '../src/server/liveProject';
import { Command as AppDevServerCommand, Event as AppDevServerEvent } from './appServer';
import { createRpcHandler, rpcServer } from '../src/server/rpc';
import { createDataHandler, createDataSourcesHandler } from '../src/server/data';

interface HealthCheck {
  gitSha1: string | null;
  circleBuildNum: string | null;
  memoryUsage: NodeJS.MemoryUsage;
  memoryUsagePretty: Record<keyof NodeJS.MemoryUsage, string>;
}

async function main() {
  const { default: chalk } = await import('chalk');
  const cmd = process.env.TOOLPAD_CMD;

  const app = express();
  const httpServer = createServer(app);

  // See https://nextjs.org/docs/advanced-features/security-headers
  app.use((req, res, expressNext) => {
    // Force the browser to trust the Content-Type header
    // https://stackoverflow.com/questions/18337630/what-is-x-content-type-options-nosniff
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    expressNext();
  });

  app.get('/', (req, res) => {
    const redirectUrl = cmd === 'dev' ? '/_toolpad' : '/prod';
    res.redirect(302, redirectUrl);
  });

  app.get('/health-check', (req, res) => {
    const memoryUsage = process.memoryUsage();
    res.json({
      gitSha1: process.env.GIT_SHA1 || null,
      circleBuildNum: process.env.CIRCLE_BUILD_NUM || null,
      memoryUsage,
      memoryUsagePretty: mapValues(memoryUsage, (usage) => prettyBytes(usage)),
    } satisfies HealthCheck);
  });

  const publicPath = path.resolve(__dirname, '../../public');
  app.use(express.static(publicPath, { index: false }));

  app.use('/api/data', createDataHandler());

  if (cmd === 'dev') {
    app.use('/api/rpc', createRpcHandler(rpcServer));
    app.use('/api/dataSources', createDataSourcesHandler());
  }

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

      cp.once('exit', () => {
        console.error(`App dev server failed`);
        process.exit(1);
      });

      await new Promise<void>((resolve) => {
        cp.on('message', (msg: AppDevServerEvent) => {
          if (msg.kind === 'ready') {
            resolve();
          }
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
        base: '/prod/',
      });
      app.use('/prod', prodHandler);
      break;
    }
    default:
      throw new Error(`Unknown toolpad command ${cmd}`);
  }

  const projectDir = process.env.TOOLPAD_PROJECT_DIR;
  const hostname = 'localhost';
  const port = Number(process.env.TOOLPAD_PORT);
  let editorNextApp: ReturnType<typeof next> | undefined;

  if (cmd === 'dev') {
    const dir = process.env.TOOLPAD_DIR;
    const dev = !!process.env.TOOLPAD_NEXT_DEV;

    // when using middleware `hostname` and `port` must be provided below
    editorNextApp = next({ dir, dev, hostname, port });
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
  }

  await listen(httpServer, port);

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.green('ready')} - toolpad project ${chalk.cyan(projectDir)} ready on ${chalk.cyan(
      `http://${hostname}:${port}`,
    )}`,
  );

  await editorNextApp?.prepare();

  const wsServer = new WebSocketServer({ noServer: true });

  const project = await getProject();

  project.events.on('externalChange', () => {
    wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ kind: 'externalChange' }));
      }
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  wsServer.on('connection', (ws: WebSocket, _request: IncomingMessage) => {
    ws.on('error', console.error);
  });

  httpServer.on('upgrade', (request, socket, head) => {
    invariant(request.url, 'request must have a url');
    const { pathname } = new URL(request.url, 'http://x');

    if (pathname === '/toolpad-ws') {
      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request);
      });
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
