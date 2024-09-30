import { parentPort, workerData, MessagePort } from 'worker_threads';
import invariant from 'invariant';
import type { Plugin } from 'vite';
import { createRpcClient } from '@toolpad/utils/workerRpc';
import type * as appDom from '@toolpad/studio-runtime/appDom';
import { createViteConfig, getEditorHtmlContent } from './toolpadAppBuilder';
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

function devServerPlugin(): Plugin {
  return {
    name: 'toolpad-dev-server',

    async configureServer(viteServer) {
      return () => {
        viteServer.middlewares.use('/', async (req, res, next) => {
          invariant(req.url, 'request must have a url');
          try {
            const dom = await loadDom();

            const template = getEditorHtmlContent();

            let html = await viteServer.transformIndexHtml(req.url, template);

            html = postProcessHtml(html, {
              initialState: createRuntimeState({ dom }),
            });

            res.setHeader('content-type', 'text/html; charset=utf-8').end(html);
          } catch (error) {
            next(error);
          }
        });
      };
    },
  };
}

export interface AppViteServerConfig {
  outDir: string;
  root: string;
  base: string;
  customServer: boolean;
  toolpadDevMode: boolean;
  port: number;
  mainThreadRpcPort: MessagePort;
}

export async function main({ port, ...config }: AppViteServerConfig) {
  const { reloadComponents, viteConfig } = await createViteConfig({
    ...config,
    dev: true,
    plugins: [devServerPlugin()],
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
        process.exit();
        break;
      }
      default:
        throw new Error(`Unknown command ${msg}`);
    }
  });

  await notifyReady();
}

main(workerData);
