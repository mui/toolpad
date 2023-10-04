import { parentPort, workerData, MessagePort } from 'worker_threads';
import invariant from 'invariant';
import { createServer, Plugin } from 'vite';
import { createRpcClient } from '@mui/toolpad-utils/workerRpc';
import { getHtmlContent, createViteConfig, resolvedComponentsId } from './toolpadAppBuilder';
import type { RuntimeConfig } from '../config';
import type * as appDom from '../appDom';
import type { ComponentEntry } from './localMode';
import { postProcessHtml } from './toolpadAppServer';

export type Command = { kind: 'reload-components' } | { kind: 'exit' };

export type WorkerRpc = {
  notifyReady: () => Promise<void>;
  loadDom: () => Promise<appDom.AppDom>;
  getComponents: () => Promise<ComponentEntry[]>;
};

const { notifyReady, loadDom, getComponents } = createRpcClient<WorkerRpc>(
  workerData.mainThreadRpcPort,
);

invariant(
  process.env.NODE_ENV === 'development',
  'The dev server must be started with NODE_ENV=development',
);

function devServerPlugin(root: string, config: RuntimeConfig): Plugin {
  return {
    name: 'toolpad-dev-server',

    async configureServer(viteServer) {
      return () => {
        viteServer.middlewares.use('/', async (req, res, next) => {
          invariant(req.url, 'request must have a url');
          try {
            const dom = await loadDom();

            const template = getHtmlContent({ canvas: true });

            let html = await viteServer.transformIndexHtml(req.url, template);

            html = postProcessHtml(html, { config, dom });

            res.setHeader('content-type', 'text/html; charset=utf-8').end(html);
          } catch (e) {
            next(e);
          }
        });
      };
    },
  };
}

export interface ToolpadAppDevServerParams {
  outDir: string;
  config: RuntimeConfig;
  root: string;
  base: string;
}

async function createDevServer({ outDir, config, root, base }: ToolpadAppDevServerParams) {
  const { viteConfig } = createViteConfig({
    outDir,
    dev: true,
    root,
    base,
    plugins: [devServerPlugin(root, config)],
    getComponents,
  });
  const devServer = await createServer(viteConfig);

  return { devServer };
}

export interface AppViteServerConfig {
  outDir: string;
  base: string;
  root: string;
  port: number;
  config: RuntimeConfig;
  mainThreadRpcPort: MessagePort;
}

export async function main({ outDir, base, config, root, port }: AppViteServerConfig) {
  const { devServer } = await createDevServer({ outDir, config, root, base });

  await devServer.listen(port);

  invariant(parentPort, 'parentPort must be defined');

  parentPort.on('message', async (msg: Command) => {
    switch (msg.kind) {
      case 'reload-components': {
        const mod = devServer.moduleGraph.getModuleById(resolvedComponentsId);
        if (mod) {
          devServer.reloadModule(mod);
        }
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

main(workerData).catch((err) => {
  console.error(err);
  process.exit(1);
});
