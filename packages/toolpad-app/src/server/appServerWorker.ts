import { parentPort, workerData, MessagePort } from 'worker_threads';
import invariant from 'invariant';
import { createServer, Plugin } from 'vite';
import { createRpcClient } from '@mui/toolpad-utils/workerRpc';
import { getHtmlContent, createViteConfig, resolvedComponentsId } from './toolpadAppBuilder';
import type { RuntimeConfig } from '../config';
import type * as appDom from '../appDom';
import type { ComponentEntry } from './localMode';
import createRuntimeState from '../runtime/createRuntimeState';
import { postProcessHtml } from './toolpadAppServer';

export type Command =
  | {
      kind: 'reload-components';
    }
  | {
      kind: 'exit';
    }
  | {
      kind: 'replace-dom';
      dom: appDom.AppDom;
    };

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

export interface ToolpadAppDevServerParams {
  outDir: string;
  config: RuntimeConfig;
  root: string;
  base: string;
  customServer: boolean;
  dom: appDom.AppDom;
}

function devServerPlugin({ config }: ToolpadAppDevServerParams): Plugin {
  return {
    name: 'toolpad-dev-server',

    async configureServer(viteServer) {
      return () => {
        viteServer.middlewares.use('/', async (req, res, next) => {
          invariant(req.url, 'request must have a url');
          const url = new URL(req.url, 'http://x');
          const canvas = url.searchParams.get('toolpad-display') === 'canvas';

          try {
            const dom = await loadDom();

            const template = getHtmlContent({ canvas });

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

async function createDevServer(config: ToolpadAppDevServerParams) {
  const { viteConfig, replaceDom } = createViteConfig({
    ...config,
    dev: true,
    plugins: [devServerPlugin(config)],
    getComponents,
  });

  const devServer = await createServer(viteConfig);

  return { devServer, replaceDom };
}

export interface AppViteServerConfig extends ToolpadAppDevServerParams {
  port: number;
  mainThreadRpcPort: MessagePort;
  config: RuntimeConfig;
  dom: appDom.AppDom;
}

export async function main({ port, ...config }: AppViteServerConfig) {
  const { devServer, replaceDom } = await createDevServer(config);

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
      case 'replace-dom': {
        replaceDom(msg.dom);
        break;
      }
      default:
        throw new Error(`Unknown command ${msg}`);
    }
  });

  await notifyReady();
}

main(workerData);
