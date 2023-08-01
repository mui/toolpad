import * as path from 'path';
import { IncomingMessage, createServer } from 'http';
import * as fs from 'fs/promises';
import express from 'express';
import invariant from 'invariant';
import { execaNode } from 'execa';
import getPort from 'get-port';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { mapValues } from '@mui/toolpad-utils/collections';
import prettyBytes from 'pretty-bytes';
import { createServer as createViteServer } from 'vite';
import serializeJavascript from 'serialize-javascript';
import { WebSocket, WebSocketServer } from 'ws';
import { listen } from '@mui/toolpad-utils/http';
import { asyncHandler } from '../src/utils/express';
import { createProdHandler } from '../src/server/toolpadAppServer';
import { getUserProjectRoot } from '../src/server/localMode';
import { getProject } from '../src/server/liveProject';
import { Command as AppDevServerCommand, Event as AppDevServerEvent } from './appServer';
import { createRpcHandler, rpcServer } from '../src/server/rpc';
import { createDataHandler, createDataSourcesHandler } from '../src/server/data';
import { RUNTIME_CONFIG_WINDOW_PROPERTY } from '../src/constants';
import config from '../src/config';

interface CreateDevHandlerParams {
  root: string;
  base: string;
}

async function createDevHandler({ root, base }: CreateDevHandlerParams) {
  const router = express.Router();

  const appServerPath = path.resolve(__dirname, './appServer.js');
  const devPort = await getPort();
  const project = await getProject();

  const cp = execaNode(appServerPath, [], {
    cwd: root,
    stdio: 'inherit',
    env: {
      NODE_ENV: 'development',
      TOOLPAD_PROJECT_DIR: root,
      TOOLPAD_PORT: String(devPort),
      TOOLPAD_BASE: base,
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

  router.use('/api/data', createDataHandler());
  router.use(
    createProxyMiddleware({
      logLevel: 'silent',
      ws: true,
      target: {
        host: 'localhost',
        port: devPort,
      },
    }),
  );

  return router;
}

interface HealthCheck {
  gitSha1: string | null;
  circleBuildNum: string | null;
  memoryUsage: NodeJS.MemoryUsage;
  memoryUsagePretty: Record<keyof NodeJS.MemoryUsage, string>;
}

interface ServerConfig {
  cmd: 'dev' | 'start';
  gitSha1: string | null;
  circleBuildNum: string | null;
  projectDir: string;
  hostname: string;
  port: number;
  devMode: boolean;
}

export async function main({
  cmd,
  gitSha1,
  circleBuildNum,
  projectDir,
  hostname,
  port,
  devMode,
}: ServerConfig) {
  const { default: chalk } = await import('chalk');

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
      gitSha1,
      circleBuildNum,
      memoryUsage,
      memoryUsagePretty: mapValues(memoryUsage, (usage) => prettyBytes(usage)),
    } satisfies HealthCheck);
  });

  const publicPath = path.resolve(__dirname, '../../public');
  app.use(express.static(publicPath, { index: false }));

  switch (cmd) {
    case 'dev': {
      const previewBase = '/preview';
      const devHandler = await createDevHandler({
        root: getUserProjectRoot(),
        base: previewBase,
      });
      app.use(previewBase, devHandler);
      break;
    }
    case 'start': {
      const prodHandler = await createProdHandler({
        root: getUserProjectRoot(),
      });
      app.use('/prod', prodHandler);
      break;
    }
    default:
      throw new Error(`Unknown toolpad command ${cmd}`);
  }

  if (cmd === 'dev') {
    app.use('/api/rpc', createRpcHandler(rpcServer));
    app.use('/api/dataSources', createDataSourcesHandler());

    const transformIndexHtml = (html: string) => {
      const serializedConfig = serializeJavascript(config, { isJSON: true });
      return html.replace(
        '<!-- __TOOLPAD_SCRIPTS__ -->',
        `
          <script>
            window[${JSON.stringify(RUNTIME_CONFIG_WINDOW_PROPERTY)}] = ${serializedConfig}
          </script>
        `,
      );
    };

    const editorBasename = '/_toolpad';
    if (devMode) {
      // eslint-disable-next-line no-console
      console.log(`${chalk.blue('info')}  - Running Toolpad editor in dev mode`);

      const viteApp = await createViteServer({
        configFile: path.resolve(__dirname, '../../src/toolpad/vite.config.ts'),
        root: path.resolve(__dirname, '../../src/toolpad'),
        server: { middlewareMode: true },
        plugins: [
          {
            name: 'toolpad:transform-index-html',
            transformIndexHtml,
          },
        ],
      });

      app.use(editorBasename, viteApp.middlewares);
    } else {
      app.use(
        editorBasename,
        express.static(path.resolve(__dirname, '../../dist/editor'), { index: false }),
        asyncHandler(async (req, res) => {
          const htmlFilePath = path.resolve(__dirname, '../../dist/editor/index.html');
          let html = await fs.readFile(htmlFilePath, { encoding: 'utf-8' });
          html = transformIndexHtml(html);
          res.setHeader('Content-Type', 'text/html').status(200).end(html);
        }),
      );
    }
  }

  await listen(httpServer, port);

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.green('ready')} - toolpad project ${chalk.cyan(projectDir)} ready on ${chalk.cyan(
      `http://${hostname}:${port}`,
    )}`,
  );

  const wsServer = new WebSocketServer({ noServer: true });

  const project = await getProject();

  project.events.on('*', (event, payload) => {
    wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ kind: 'projectEvent', event, payload }));
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

invariant(
  process.env.TOOLPAD_CMD === 'dev' || process.env.TOOLPAD_CMD === 'start',
  'TOOLPAD_PROJECT_DIR must be set',
);
invariant(process.env.TOOLPAD_PROJECT_DIR, 'TOOLPAD_PROJECT_DIR must be set');

main({
  cmd: process.env.TOOLPAD_CMD,
  gitSha1: process.env.GIT_SHA1 || null,
  circleBuildNum: process.env.CIRCLE_BUILD_NUM || null,
  projectDir: process.env.TOOLPAD_PROJECT_DIR,
  hostname: 'localhost',
  port: Number(process.env.TOOLPAD_PORT),
  devMode: process.env.TOOLPAD_NEXT_DEV === '1',
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
