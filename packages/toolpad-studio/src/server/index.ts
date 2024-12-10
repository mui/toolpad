import * as path from 'path';
import { IncomingMessage, createServer } from 'http';
import { Worker, MessageChannel } from 'worker_threads';
import express from 'express';
import getPort from 'get-port';
import { legacyCreateProxyMiddleware as createProxyMiddleware } from 'http-proxy-middleware';
import { mapValues } from '@toolpad/utils/collections';
import prettyBytes from 'pretty-bytes';
import { WebSocket, WebSocketServer } from 'ws';
import { listen } from '@toolpad/utils/http';
import openBrowser from 'react-dev-utils/openBrowser.js';
import chalk from 'chalk';
import { serveRpc } from '@toolpad/utils/workerRpc';
import * as url from 'node:url';
import cors from 'cors';
import compression from 'compression';
import { asyncHandler } from '../utils/express';
import { createProdHandler } from './toolpadAppServer';
import { initProject, resolveProjectDir, type ToolpadProject } from './localMode';
import type {
  Command as AppDevServerCommand,
  AppViteServerConfig,
  WorkerRpc,
} from './appServerWorker';
import { createRpcHandler } from './rpc';
import { createRpcServer as createProjectRpcServer } from './projectRpcServer';
import { createRpcServer as createRuntimeRpcServer } from './runtimeRpcServer';
import { createAuthHandler, createRequireAuthMiddleware, getRequireAuthentication } from './auth';

// crypto must be polyfilled to use @auth/core in Node 18 or lower
globalThis.crypto ??= (await import('node:crypto')) as Crypto;

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

  const [wsPort, devPort] = await Promise.all([getPort(), getPort()]);

  const mainThreadRpcChannel = new MessageChannel();
  const worker = new Worker(appServerPath, {
    workerData: {
      toolpadDevMode: project.options.toolpadDevMode,
      outDir: project.getAppOutputFolder(),
      base: project.options.base,
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
    getComponents: async () => project.getComponentsManifest(),
    getPagesManifest: async () => project.getPagesManifest(),
  });

  project.events.on('componentsListChanged', () => {
    worker.postMessage({ kind: 'reload-components' } satisfies AppDevServerCommand);
  });

  const rpcServer = createProjectRpcServer(project);
  handler.use('/__toolpad_dev__/rpc', createRpcHandler(rpcServer));

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

  const hasAuthentication = await getRequireAuthentication(project);
  if (hasAuthentication) {
    const authHandler = createAuthHandler(project);
    handler.use('/api/auth', express.urlencoded({ extended: true }), authHandler);

    handler.use(await createRequireAuthMiddleware(project));
  }

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
  toolpadDevMode?: boolean;
}

export async function createHandler({
  dev = false,
  dir = './toolpad',
  base = '/prod',
}: ToolpadHandlerConfig): Promise<AppHandler> {
  const project = await initProject({ dev, dir, base, customServer: true });
  await project.start();

  const appHandler = await createToolpadAppHandler(project);

  return {
    handler: appHandler.handler,
    dispose: async () => {
      await Promise.allSettled([project.dispose(), appHandler.dispose()]);
    },
  };
}

async function createToolpadHandler({
  dev,
  base,
  dir,
  toolpadDevMode,
}: ToolpadHandlerConfig): Promise<AppHandler> {
  const editorBasename = '/_toolpad';

  const project = await initProject({ toolpadDevMode, dev, dir, base });
  await project.checkPlan();
  await project.start();

  const router = express.Router();

  // See https://nextjs.org/docs/advanced-features/security-headers
  router.use((req, res, expressNext) => {
    // Force the browser to trust the Content-Type header
    // https://stackoverflow.com/questions/18337630/what-is-x-content-type-options-nosniff
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    res.setHeader(
      'Content-Security-Policy',
      [
        `default-src * data: mediastream: blob: filesystem: about: ws: wss: 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline';`,
        `script-src * data: blob: 'unsafe-inline' 'unsafe-eval';`,
        `script-src-elem * data: blob: 'unsafe-inline';`,
        `connect-src * data: blob: 'unsafe-inline';`,
        `img-src * data: blob: 'unsafe-inline';`,
        `media-src * data: blob: 'unsafe-inline';`,
        `frame-src * data: blob: ;`,
        `style-src * data: blob: 'unsafe-inline';`,
        `font-src * data: blob: 'unsafe-inline';`,
        `frame-ancestors *;`,
      ].join(' '),
    );

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
    router.use('/_toolpad', (req, res) => {
      res.redirect(`${project.options.base}/editor${req.url}`);
    });
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
  app.disable('x-powered-by');

  const httpServer = createServer(app);

  app.use(compression());

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
    throw new Error(`Not a Toolpad Studio app or not running in dev mode`);
  }
  return new URL(appBase, appUrl).toString();
}

export async function runEditor(appUrl: string) {
  let appRootUrl;
  try {
    appRootUrl = await fetchAppUrl(appUrl);
  } catch (err: any) {
    console.error(
      `${chalk.red('error')} - No Toolpad Studio application found running under ${chalk.cyan(appUrl)}\n` +
        `        Find more information about running a custom server at ${chalk.cyan(
          'https://mui.com/toolpad/studio/concepts/custom-server/',
        )}`,
    );

    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.yellow('warn')}  - The editor command is deprecated and will be removed in the future, please visit ${chalk.cyan(`${appRootUrl}/editor`)}`,
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

  const server = await startToolpadServer({
    dev,
    base,
    dir,
    port,
    toolpadDevMode: !!process.env.TOOLPAD_NEXT_DEV || toolpadDevMode,
  });

  const toolpadUrl = `http://localhost:${server.port}/`;

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.green('ready')} - Toolpad Studio project ${chalk.cyan(projectDir)} ready on ${chalk.cyan(
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
