import * as path from 'path';
import { IncomingMessage, createServer } from 'http';
import * as fs from 'fs/promises';
import { Worker } from 'worker_threads';
import express from 'express';
import invariant from 'invariant';
import getPort from 'get-port';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { mapValues } from '@mui/toolpad-utils/collections';
import prettyBytes from 'pretty-bytes';
import { createServer as createViteServer } from 'vite';
import serializeJavascript from 'serialize-javascript';
import { WebSocket, WebSocketServer } from 'ws';
import { listen } from '@mui/toolpad-utils/http';
import openBrowser from 'react-dev-utils/openBrowser';
import { folderExists } from '@mui/toolpad-utils/fs';
import chalk from 'chalk';
import { asyncHandler } from '../src/utils/express';
import { createProdHandler } from '../src/server/toolpadAppServer';
import {
  ToolpadProject,
  getAppOutputFolder,
  getComponents,
  initProject,
} from '../src/server/localMode';
import type { Command as AppDevServerCommand, AppViteServerConfig, WorkerRpc } from './appServer';
import { createRpcHandler, createRpcServer } from '../src/server/rpc';
import { RUNTIME_CONFIG_WINDOW_PROPERTY } from '../src/constants';
import type { RuntimeConfig } from '../src/config';
import { createWorkerRpcServer } from '../src/server/workerRpc';

const DEFAULT_PORT = 3000;

function* getPreferredPorts(port: number = DEFAULT_PORT): Iterable<number> {
  while (true) {
    yield port;
    port += 1;
  }
}

interface CreateDevHandlerParams {
  base: string;
  runtimeConfig: RuntimeConfig;
}

async function createDevHandler(
  project: ToolpadProject,
  { base, runtimeConfig }: CreateDevHandlerParams,
) {
  const handler = express.Router();

  const appServerPath = path.resolve(__dirname, './appServer.js');
  const devPort = await getPort();

  const worker = new Worker(appServerPath, {
    workerData: {
      outDir: getAppOutputFolder(project.getRoot()),
      base,
      config: runtimeConfig,
      root: project.getRoot(),
      port: devPort,
    } satisfies AppViteServerConfig,
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  });

  worker.once('exit', (code) => {
    console.error(`App dev server failed ${code}`);
    process.exit(1);
  });

  let resolveReadyPromise: () => void | undefined;
  const readyPromise = new Promise<void>((resolve) => {
    resolveReadyPromise = resolve;
  });

  createWorkerRpcServer<WorkerRpc>(worker, {
    notifyReady: async () => resolveReadyPromise?.(),
    loadDom: async () => project.loadDom(),
    getComponents: async () => getComponents(project.getRoot()),
  });

  project.events.on('componentsListChanged', () => {
    worker.postMessage({ kind: 'reload-components' } satisfies AppDevServerCommand);
  });

  handler.use('/api/data', project.dataManager.createDataHandler(project));
  handler.use(
    (req, res, next) => {
      // Stall the request until the dev server is ready
      readyPromise.then(next, next);
    },
    createProxyMiddleware({
      logLevel: 'silent',
      ws: true,
      target: {
        host: 'localhost',
        port: devPort,
      },
    }),
  );

  return {
    handler,
    async dispose() {
      worker.postMessage({ kind: 'exit' } satisfies AppDevServerCommand);
    },
  };
}

interface HealthCheck {
  gitSha1: string | null;
  circleBuildNum: string | null;
  memoryUsage: NodeJS.MemoryUsage;
  memoryUsagePretty: Record<keyof NodeJS.MemoryUsage, string>;
}

interface AppHandler {
  handler: express.Handler;
  dispose?: () => Promise<void>;
}

export interface ServerConfig {
  cmd: 'dev' | 'start' | 'build';
  gitSha1: string | null;
  circleBuildNum: string | null;
  projectDir: string;
  port: number;
  devMode: boolean;
  externalUrl: string;
  project: ToolpadProject;
}

async function startServer({
  cmd,
  gitSha1,
  circleBuildNum,
  port,
  devMode,
  externalUrl,
  project,
}: ServerConfig) {
  const runtimeConfig: RuntimeConfig = {
    cmd,
    projectDir: project.getRoot(),
    externalUrl,
  };

  await project.start();

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

  let appHandler: AppHandler | undefined;

  switch (cmd) {
    case 'dev': {
      const previewBase = '/preview';
      appHandler = await createDevHandler(project, {
        runtimeConfig,
        base: previewBase,
      });
      app.use(previewBase, appHandler.handler);
      break;
    }
    case 'start': {
      appHandler = await createProdHandler(project);
      app.use('/prod', appHandler.handler);
      break;
    }
    default:
      throw new Error(`Unknown toolpad command ${cmd}`);
  }

  if (cmd === 'dev') {
    const rpcServer = createRpcServer(project);
    app.use('/api/rpc', createRpcHandler(rpcServer));
    app.use('/api/dataSources', project.dataManager.createDataSourcesHandler());

    const transformIndexHtml = (html: string) => {
      const serializedConfig = serializeJavascript(runtimeConfig, { isJSON: true });
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

  const runningServer = await listen(httpServer, port);

  const wsServer = new WebSocketServer({ noServer: true });

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

  return {
    port: runningServer.port,
    async dispose() {
      await Promise.allSettled([runningServer.close(), appHandler?.dispose?.()]);
    },
  };
}

export type Command = 'dev' | 'start' | 'build';
export interface RunAppOptions {
  cmd: Command;
  port?: number;
  dev?: boolean;
  projectDir: string;
}

export interface RunAppResult {
  dispose(): Promise<void>;
}

export async function runApp({ cmd, port, dev = false, projectDir }: RunAppOptions) {
  if (!(await folderExists(projectDir))) {
    console.error(`${chalk.red('error')} - No project found at ${chalk.cyan(`"${projectDir}"`)}`);
    process.exit(1);
  }

  if (!port) {
    port = cmd === 'dev' ? await getPort({ port: getPreferredPorts(DEFAULT_PORT) }) : DEFAULT_PORT;
  } else {
    // if port is specified but is not available, exit
    const availablePort = await getPort({ port });
    if (availablePort !== port) {
      console.error(`${chalk.red('error')} - Port ${port} is not available. Aborted.`);
      process.exit(1);
    }
  }

  const editorDevMode = !!process.env.TOOLPAD_NEXT_DEV || dev;

  const externalUrl = process.env.TOOLPAD_EXTERNAL_URL || `http://localhost:${port}`;

  const project = await initProject(cmd, projectDir);

  const server = await startServer({
    cmd,
    project,
    gitSha1: process.env.GIT_SHA1 || null,
    circleBuildNum: process.env.CIRCLE_BUILD_NUM || null,
    projectDir,
    port,
    devMode: editorDevMode,
    externalUrl,
  });

  const toolpadBaseUrl = `http://localhost:${server.port}/`;

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.green('ready')} - toolpad project ${chalk.cyan(projectDir)} ready on ${chalk.cyan(
      toolpadBaseUrl,
    )}`,
  );

  if (cmd === 'dev') {
    try {
      openBrowser(toolpadBaseUrl);
    } catch (err: any) {
      console.error(`${chalk.red('error')} - Failed to open browser: ${err.message}`);
    }
  }

  return {
    async dispose() {
      await Promise.allSettled([project.dispose(), server.dispose()]);
    },
  };
}
