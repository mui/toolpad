import { parentPort, workerData, MessagePort } from 'worker_threads';
import invariant from 'invariant';
import type { Plugin } from 'vite';
import { createRpcClient } from '@mui/toolpad-utils/workerRpc';
import { getHtmlContent, createViteConfig } from './toolpadAppBuilder';
import type { RuntimeConfig } from '../types';
import type * as appDom from '../appDom';
import type { ComponentEntry, PagesManifest } from './localMode';
import createRuntimeState from '../runtime/createRuntimeState';
import { postProcessHtml } from './toolpadAppServer';

export type Command = { kind: 'reload-components' } | { kind: 'exit' };

export type WorkerRpc = {
  notifyReady: () => Promise<void>;
  loadDom: () => Promise<appDom.AppDom>;
  getComponents: () => Promise<ComponentEntry[]>;
  getPagesManifest: () => Promise<PagesManifest>;
};

const { notifyReady, loadDom, getComponents, getPagesManifest } = createRpcClient<WorkerRpc>(
  workerData.mainThreadRpcPort,
);

invariant(
  process.env.NODE_ENV === 'development',
  'The dev server must be started with NODE_ENV=development',
);

export interface ToolpadAppDevServerParams {
  outDir: string;
  config: RuntimeConfig;
  root: string;
  base: string;
  customServer: boolean;
}

function devServerPlugin({ config, base }: ToolpadAppDevServerParams): Plugin {
  return {
    name: 'toolpad-dev-server',

    async configureServer(viteServer) {
      return () => {
        viteServer.middlewares.use('/', async (req, res, next) => {
          invariant(req.url, 'request must have a url');
          try {
            const dom = await loadDom();

            const template = getHtmlContent({ canvas: true, base });

            let html = await viteServer.transformIndexHtml(req.url, template);

            html = postProcessHtml(html, {
              config,
              initialState: createRuntimeState({ dom }),
            });

            res.setHeader('content-type', 'text/html; charset=utf-8').end(html);
          } catch (e) {
            next(e);
          }
        });
      };
    },
  };
}

export interface AppViteServerConfig extends ToolpadAppDevServerParams {
  port: number;
  mainThreadRpcPort: MessagePort;
}

export async function main({ port, ...config }: AppViteServerConfig) {
  const { reloadComponents, viteConfig } = await createViteConfig({
    ...config,
    dev: true,
    plugins: [devServerPlugin(config)],
    getComponents,
    getPagesManifest,
    loadDom,
  });

  const vite = await import('vite');
  const devServer = await vite.createServer(viteConfig);

  await devServer.listen(port);

  invariant(parentPort, 'parentPort must be defined');

  parentPort.on('message', async (msg: Command) => {
    switch (msg.kind) {
      case 'reload-components': {
        reloadComponents();
        break;
      }
      case 'exit': {
        await devServer.close();
        break;
      }
      default:
        throw new Error(`Unknown command ${msg}`);
    }
  });

  await notifyReady();
}

main(workerData);
