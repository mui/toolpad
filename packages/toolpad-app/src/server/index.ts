import * as path from 'path';
import { IncomingMessage, createServer } from 'http';
import * as fs from 'fs/promises';
import { Worker, MessageChannel } from 'worker_threads';
import express from 'express';
import getPort from 'get-port';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { mapValues } from '@mui/toolpad-utils/collections';
import prettyBytes from 'pretty-bytes';
import type { ViteDevServer } from 'vite';
import { WebSocket, WebSocketServer } from 'ws';
import { listen } from '@mui/toolpad-utils/http';
// eslint-disable-next-line import/extensions
import openBrowser from 'react-dev-utils/openBrowser.js';
import chalk from 'chalk';
import { serveRpc } from '@mui/toolpad-utils/workerRpc';
import * as url from 'node:url';
import cors from 'cors';
import { asyncHandler } from '../utils/express';
import { createProdHandler } from './toolpadAppServer';
import { initProject, resolveProjectDir, type ToolpadProject } from './localMode';
import type {
  Command as AppDevServerCommand,
  AppViteServerConfig,
  WorkerRpc,
} from './appServerWorker';
import { createRpcHandler } from './rpc';
import { APP_URL_WINDOW_PROPERTY } from '../constants';
import { createRpcServer as createProjectRpcServer } from './projectRpcServer';
import { createRpcServer as createRuntimeRpcServer } from './runtimeRpcServer';

import.meta.url ??= url.pathToFileURL(__filename).toString();
const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const DEFAULT_PORT = 3000;

function* getPreferredPorts(port: number = DEFAULT_PORT): Iterable<number> {
  while (true) {
    yield port;
    port += 1;
  }
}

async function createDevHandler(project: ToolpadProject) {
  const handler = express.Router();

  handler.use((req, res, next) => {
    res.setHeader('X-Toolpad-Base', project.options.base);
    next();
  });

  handler.use(cors());

  const appServerPath = path.resolve(currentDirectory, '../cli/appServerWorker.mjs');

  const [wsPort, devPort, runtimeConfig] = await Promise.all([
    getPort(),
    getPort(),
    project.getRuntimeConfig(),
  ]);

  const mainThreadRpcChannel = new MessageChannel();

  const worker = new Worker(appServerPath, {
    workerData: {
      outDir: project.getAppOutputFolder(),
      base: project.options.base,
      config: runtimeConfig,
      root: project.getRoot(),
      port: devPort,
      mainThreadRpcPort: mainThreadRpcChannel.port1,
      customServer: project.options.customServer,
    } satisfies AppViteServerConfig,
    transferList: [mainThreadRpcChannel.port1],
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

  serveRpc<WorkerRpc>(mainThreadRpcChannel.port2, {
    notifyReady: async () => resolveReadyPromise?.(),
    loadDom: async () => project.loadDom(),
    getComponents: async () => project.getComponents(),
    getPagesManifest: async () => project.getPagesManifest(),
  });

  project.events.on('componentsListChanged', () => {
    worker.postMessage({ kind: 'reload-components' } satisfies AppDevServerCommand);
  });

  const rpcServer = createProjectRpcServer(project);
  handler.use('/__toolpad_dev__/rpc', createRpcHandler(rpcServer));

  handler.use(
    '/__toolpad_dev__/reactDevtools',
    express.static(path.resolve(currentDirectory, '../../dist/reactDevtools')),
  );

  handler.use(
    '/__toolpad_dev__/manifest.json',
    asyncHandler(async (req, res) => {
      const wsProtocol = req.protocol === 'http' ? 'ws' : 'wss';
      res.json({
        rootDir: project.getRoot(),
        wsUrl: `${wsProtocol}://${req.hostname}:${wsPort}`,
      });
    }),
  );

  handler.use('/api/data', project.dataManager.createDataHandler());
  const runtimeRpcServer = createRuntimeRpcServer(project);

  handler.use('/api/runtime-rpc', createRpcHandler(runtimeRpcServer));
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

  const wsServer = new WebSocketServer({ port: wsPort });

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

  // TODO(Jan): allow passing a server instance to the handler and attach websocket server to it
  // httpServer.on('upgrade', (request, socket, head) => {
  //   invariant(request.url, 'request must have a url');
  //   const { pathname } = new URL(request.url, 'http://x');
  //
  //   if (pathname === '/toolpad-ws') {
  //     wsServer.handleUpgrade(request, socket, head, (ws) => {
  //       wsServer.emit('connection', ws, request);
  //     });
  //   }
  // });

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
  dispose: () => Promise<void>;
}

async function createToolpadAppHandler(project: ToolpadProject): Promise<AppHandler> {
  const appHandler = project.options.dev
    ? await createDevHandler(project)
    : await createProdHandler(project);
  return appHandler;
}

export interface ToolpadHandlerConfig {
  dev: boolean;
  dir: string;
  base: string;
  externalUrl: string;
  toolpadDevMode?: boolean;
}

export async function createHandler({
  dev = false,
  dir = './toolpad',
  base = '/prod',
  externalUrl = 'http://localhost:3000',
}: ToolpadHandlerConfig): Promise<AppHandler> {
  const project = await initProject({ dev, dir, externalUrl, base, customServer: true });
  await project.start();

  const appHandler = await createToolpadAppHandler(project);

  return {
    handler: appHandler.handler,
    dispose: async () => {
      await Promise.allSettled([project.dispose(), appHandler.dispose()]);
    },
  };
}

interface EditorHandlerParams {
  toolpadDevMode?: boolean;
}

async function createEditorHandler(
  appUrl: string,
  { toolpadDevMode = false }: EditorHandlerParams,
): Promise<AppHandler> {
  const router = express.Router();

  const transformIndexHtml = (html: string) => {
    return html.replace(
      '<!-- __TOOLPAD_SCRIPTS__ -->',

      `<script>window[${JSON.stringify(APP_URL_WINDOW_PROPERTY)}] = ${JSON.stringify(
        appUrl,
      )}</script>
      `,
    );
  };

  let viteApp: ViteDevServer | undefined;

  if (toolpadDevMode) {
    // eslint-disable-next-line no-console
    console.log(`${chalk.blue('info')}  - Running Toolpad editor in dev mode`);

    const vite = await import('vite');
    viteApp = await vite.createServer({
      configFile: path.resolve(currentDirectory, '../../src/toolpad/vite.config.mts'),
      root: path.resolve(currentDirectory, '../../src/toolpad'),
      server: { middlewareMode: true },
      plugins: [
        {
          name: 'toolpad:transform-index-html',
          transformIndexHtml,
        },
      ],
    });

    router.use('/', viteApp.middlewares);
  } else {
    router.use(
      '/',
      express.static(path.resolve(currentDirectory, '../../dist/editor'), { index: false }),
      asyncHandler(async (req, res) => {
        const htmlFilePath = path.resolve(currentDirectory, '../../dist/editor/index.html');
        let html = await fs.readFile(htmlFilePath, { encoding: 'utf-8' });
        html = transformIndexHtml(html);
        res.setHeader('Content-Type', 'text/html').status(200).end(html);
      }),
    );
  }

  return {
    handler: router,
    async dispose() {
      await viteApp?.close();
    },
  };
}

async function createToolpadHandler({
  dev,
  externalUrl,
  base,
  dir,
  toolpadDevMode,
}: ToolpadHandlerConfig): Promise<AppHandler> {
  const editorBasename = '/_toolpad';

  const project = await initProject({ dev, dir, externalUrl, base });
  await project.start();

  const router = express.Router();

  // See https://nextjs.org/docs/advanced-features/security-headers
  router.use((req, res, expressNext) => {
    // Force the browser to trust the Content-Type header
    // https://stackoverflow.com/questions/18337630/what-is-x-content-type-options-nosniff
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    expressNext();
  });

  router.get('/', (req, res) => {
    const redirectUrl = dev ? editorBasename : project.options.base;
    res.redirect(302, redirectUrl);
  });

  const publicPath = path.resolve(currentDirectory, '../../public');
  router.use(express.static(publicPath, { index: false }));

  const appHandler = await createToolpadAppHandler(project);
  router.use(project.options.base, appHandler.handler);

  let editorHandler: AppHandler | undefined;
  if (dev) {
    editorHandler = await createEditorHandler(project.options.base, { toolpadDevMode });
    router.use(editorBasename, editorHandler.handler);
  }

  return {
    handler: router,
    dispose: async () => {
      await Promise.allSettled([
        project.dispose(),
        appHandler?.dispose(),
        editorHandler?.dispose(),
      ]);
    },
  };
}

export interface ToolpadServerConfig extends Omit<ToolpadHandlerConfig, 'server'> {
  port: number;
}

async function startToolpadServer({ port, ...config }: ToolpadServerConfig) {
  const gitSha1 = process.env.GIT_SHA1 || null;
  const circleBuildNum = process.env.CIRCLE_BUILD_NUM || null;

  const app = express();
  const httpServer = createServer(app);

  app.get('/health-check', (req, res) => {
    const memoryUsage = process.memoryUsage();
    res.json({
      gitSha1,
      circleBuildNum,
      memoryUsage,
      memoryUsagePretty: mapValues(memoryUsage, (usage) => prettyBytes(usage)),
    } satisfies HealthCheck);
  });

  const toolpadHandler = await createToolpadHandler(config);

  app.use(toolpadHandler.handler);

  const runningServer = await listen(httpServer, port);

  return {
    port: runningServer.port,
    async dispose() {
      await Promise.allSettled([runningServer.close(), toolpadHandler?.dispose?.()]);
    },
  };
}

async function fetchAppUrl(appUrl: string): Promise<string> {
  const res = await fetch(appUrl);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const appBase = res.headers.get('X-Toolpad-Base');
  if (!appBase) {
    throw new Error(`Not a Toolpad app or not running in dev mode`);
  }
  return new URL(appBase, appUrl).toString();
}

export interface RunEditorOptions {
  port?: number;
  toolpadDevMode?: boolean;
}

export async function runEditor(appUrl: string, options: RunEditorOptions = {}) {
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - starting Toolpad editor...`);

  let appRootUrl;
  try {
    appRootUrl = await fetchAppUrl(appUrl);
  } catch (err: any) {
    console.error(
      `${chalk.red('error')} - No Toolpad application found running under ${chalk.cyan(appUrl)}\n` +
        `        Find more information about running a custom server at ${chalk.cyan(
          'https://mui.com/toolpad/concepts/custom-server/',
        )}`,
    );

    process.exit(1);
  }

  const app = express();

  const editorBasename = '/_toolpad';
  const { pathname, origin } = new URL(appRootUrl);

  const editorHandler = await createEditorHandler(pathname, options);

  app.use(
    pathname,
    createProxyMiddleware({
      logLevel: 'silent',
      ws: true,
      target: origin,
    }),
  );

  app.use(editorBasename, editorHandler.handler);

  const port = options.port || (await getPort({ port: getPreferredPorts(DEFAULT_PORT) }));
  const server = await listen(app, port);

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.green('ready')} - Toolpad editor ready on ${chalk.cyan(
      `http://localhost:${server.port}${editorBasename}`,
    )}`,
  );
}

export interface RunAppOptions {
  dev?: boolean;
  port?: number;
  dir?: string;
  base?: string;
  toolpadDevMode?: boolean;
}

export async function runApp({
  dev = false,
  dir = '.',
  base = '/prod',
  port,
  toolpadDevMode = false,
}: RunAppOptions) {
  const projectDir = resolveProjectDir(dir);

  if (!port) {
    port = dev ? await getPort({ port: getPreferredPorts(DEFAULT_PORT) }) : DEFAULT_PORT;
  } else {
    // if port is specified but is not available, exit
    const availablePort = await getPort({ port });
    if (availablePort !== port) {
      console.error(`${chalk.red('error')} - Port ${port} is not available. Aborted.`);
      process.exit(1);
    }
  }

  const externalUrl = process.env.TOOLPAD_EXTERNAL_URL || `http://localhost:${port}`;

  const server = await startToolpadServer({
    dev,
    base,
    dir,
    port,
    toolpadDevMode: !!process.env.TOOLPAD_NEXT_DEV || toolpadDevMode,
    externalUrl,
  });

  const toolpadUrl = `http://localhost:${server.port}/`;

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.green('ready')} - toolpad project ${chalk.cyan(projectDir)} ready on ${chalk.cyan(
      toolpadUrl,
    )}`,
  );

  if (dev) {
    try {
      openBrowser(toolpadUrl);
    } catch (err: any) {
      console.error(`${chalk.red('error')} - Failed to open browser: ${err.message}`);
    }
  }

  return {
    async dispose() {
      await Promise.allSettled([server.dispose()]);
    },
  };
}
