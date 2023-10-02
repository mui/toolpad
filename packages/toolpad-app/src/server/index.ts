import * as path from 'path';
import { IncomingMessage, createServer } from 'http';
import * as fs from 'fs/promises';
import { Worker, MessageChannel } from 'worker_threads';
import express from 'express';
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
import { serveRpc } from '@mui/toolpad-utils/workerRpc';
import * as url from 'node:url';
import { asyncHandler } from '../utils/express';
import { createProdHandler } from './toolpadAppServer';
import { ToolpadProject, initProject } from './localMode';
import type { Command as AppDevServerCommand, AppViteServerConfig, WorkerRpc } from './appServer';
import { createRpcHandler } from './rpc';
import { RUNTIME_CONFIG_WINDOW_PROPERTY } from '../constants';
import type { RuntimeConfig } from '../config';
import { createRpcServer } from './rpcServer';
import { createRpcRuntimeServer } from './rpcRuntimeServer';

import.meta.url ??= url.pathToFileURL(__filename).toString();
const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const DEFAULT_PORT = 3000;

function* getPreferredPorts(port: number = DEFAULT_PORT): Iterable<number> {
  while (true) {
    yield port;
    port += 1;
  }
}

interface CreateAppHandlerParams {
  base: string;
}

async function createDevHandler(project: ToolpadProject, { base }: CreateAppHandlerParams) {
  const handler = express.Router();

  const appServerPath = path.resolve(currentDirectory, './appServer.js');
  const devPort = await getPort();

  const mainThreadRpcChannel = new MessageChannel();

  const worker = new Worker(appServerPath, {
    workerData: {
      outDir: project.getAppOutputFolder(),
      base,
      config: project.getRuntimeConfig(),
      root: project.getRoot(),
      port: devPort,
      mainThreadRpcPort: mainThreadRpcChannel.port1,
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
  });

  project.events.on('componentsListChanged', () => {
    worker.postMessage({ kind: 'reload-components' } satisfies AppDevServerCommand);
  });

  handler.use('/api/data', project.dataManager.createDataHandler());
  const runtimeRpcServer = createRpcRuntimeServer(project);
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

async function createToolpadAppHandler(
  project: ToolpadProject,
  { base }: CreateAppHandlerParams,
): Promise<AppHandler> {
  const router = express.Router();
  const publicPath = path.resolve(currentDirectory, '../../public');
  router.use(express.static(publicPath, { index: false }));

  const appHandler = project.options.dev
    ? await createDevHandler(project, { base })
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

async function createToolpadHandler({
  dev,
  toolpadDevMode,
  externalUrl,
  base,
  dir,
}: ToolpadHandlerConfig): Promise<AppHandler> {
  const editorBasename = '/_toolpad';
  const gitSha1 = process.env.GIT_SHA1 || null;
  const circleBuildNum = process.env.CIRCLE_BUILD_NUM || null;

  const wsPort = await getPort();

  const project = await initProject({ dev, dir, externalUrl, wsPort, base });
  await project.start();

  const runtimeConfig: RuntimeConfig = project.getRuntimeConfig();

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
    const redirectUrl = dev ? editorBasename : base;
    res.redirect(302, redirectUrl);
  });

  router.get('/health-check', (req, res) => {
    const memoryUsage = process.memoryUsage();
    res.json({
      gitSha1,
      circleBuildNum,
      memoryUsage,
      memoryUsagePretty: mapValues(memoryUsage, (usage) => prettyBytes(usage)),
    } satisfies HealthCheck);
  });

  const publicPath = path.resolve(currentDirectory, '../../public');
  router.use(express.static(publicPath, { index: false }));

  const appHandler = await createToolpadAppHandler(project, { base });
  router.use(base, appHandler.handler);

  if (dev) {
    const rpcServer = createRpcServer(project);
    router.use('/api/rpc', createRpcHandler(rpcServer));
    router.use('/api/dataSources', project.dataManager.createDataSourcesHandler());

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

    if (toolpadDevMode) {
      // eslint-disable-next-line no-console
      console.log(`${chalk.blue('info')}  - Running Toolpad editor in dev mode`);

      const viteApp = await createViteServer({
        configFile: path.resolve(currentDirectory, '../../src/toolpad/vite.config.ts'),
        root: path.resolve(currentDirectory, '../../src/toolpad'),
        server: { middlewareMode: true },
        plugins: [
          {
            name: 'toolpad:transform-index-html',
            transformIndexHtml,
          },
        ],
      });

      router.use(editorBasename, viteApp.middlewares);
    } else {
      router.use(
        editorBasename,
        express.static(path.resolve(currentDirectory, '../../dist/editor'), { index: false }),
        asyncHandler(async (req, res) => {
          const htmlFilePath = path.resolve(currentDirectory, '../../dist/editor/index.html');
          let html = await fs.readFile(htmlFilePath, { encoding: 'utf-8' });
          html = transformIndexHtml(html);
          res.setHeader('Content-Type', 'text/html').status(200).end(html);
        }),
      );
    }
  }

  if (dev) {
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
  }

  return {
    handler: router,
    dispose: async () => {
      await Promise.allSettled([project.dispose(), appHandler?.dispose?.()]);
    },
  };
}

export interface ToolpadServerConfig extends Omit<ToolpadHandlerConfig, 'server'> {
  port: number;
}

async function startToolpadServer({ port, ...config }: ToolpadServerConfig) {
  const app = express();
  const httpServer = createServer(app);

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

export type Command = 'dev' | 'start';
export interface RunAppOptions {
  cmd: Command;
  port?: number;
  dir: string;
  base: string;
  toolpadDevMode?: boolean;
}

export async function runApp({ cmd, dir, base, port, toolpadDevMode = false }: RunAppOptions) {
  const dev = cmd === 'dev';

  if (!(await folderExists(dir))) {
    console.error(`${chalk.red('error')} - No project found at ${chalk.cyan(`"${dir}"`)}`);
    process.exit(1);
  }

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
    `${chalk.green('ready')} - toolpad project ${chalk.cyan(dir)} ready on ${chalk.cyan(
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
