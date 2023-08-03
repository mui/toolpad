import invariant from 'invariant';
import { createServer, Plugin } from 'vite';
import { parentPort, workerData, MessageChannel, MessagePort } from 'worker_threads';
import {
  getHtmlContent,
  postProcessHtml,
  createViteConfig,
  resolvedComponentsId,
} from '../src/server/toolpadAppBuilder';
import type { RuntimeConfig } from '../src/config';
import type * as appDom from '../src/appDom';
import type { ComponentEntry } from '../src/server/localMode';

export type Command = {
  kind: 'reload-components';
};

export type Event =
  | {
      kind: 'ready';
    }
  | {
      kind: 'get-dom';
      port: MessagePort;
    }
  | {
      kind: 'get-components';
      port: MessagePort;
    };

export type MsgResponse<R = unknown> =
  | {
      error: Error;
      result?: undefined;
    }
  | {
      error?: undefined;
      result: R;
    };

async function getDom(): Promise<appDom.AppDom> {
  return new Promise((resolve, reject) => {
    invariant(parentPort, 'parentPort must be defined');
    const { port1, port2 } = new MessageChannel();
    port1.on('message', (msg: MsgResponse<appDom.AppDom>) => {
      if (msg.error) {
        reject(msg.error);
      } else {
        resolve(msg.result);
      }
    });
    parentPort.postMessage({ kind: 'get-dom', port: port2 } satisfies Event, [port2]);
  });
}

async function getComponents(): Promise<ComponentEntry[]> {
  return new Promise((resolve, reject) => {
    invariant(parentPort, 'parentPort must be defined');
    const { port1, port2 } = new MessageChannel();
    port1.on('message', (msg: MsgResponse<ComponentEntry[]>) => {
      if (msg.error) {
        reject(msg.error);
      } else {
        resolve(msg.result);
      }
    });
    parentPort.postMessage({ kind: 'get-components', port: port2 } satisfies Event, [port2]);
  });
}

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
          const url = new URL(req.url, 'http://x');
          const canvas = url.searchParams.get('toolpad-display') === 'canvas';

          try {
            const dom = await getDom();

            const template = getHtmlContent({ canvas });

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

export async function createDevServer({ outDir, config, root, base }: ToolpadAppDevServerParams) {
  const devServer = await createServer(
    createViteConfig({
      outDir,
      dev: true,
      root,
      base,
      plugins: [devServerPlugin(root, config)],
      getComponents,
    }),
  );

  return devServer;
}

export interface AppViteServerConfig {
  outDir: string;
  base: string;
  root: string;
  port: number;
  config: RuntimeConfig;
}

export async function main({ outDir, base, config, root, port }: AppViteServerConfig) {
  const app = await createDevServer({ outDir, config, root, base });

  await app.listen(port);

  invariant(parentPort, 'parentPort must be defined');

  parentPort.on('message', (msg: Command) => {
    if (msg.kind === 'reload-components') {
      const mod = app.moduleGraph.getModuleById(resolvedComponentsId);
      if (mod) {
        app.reloadModule(mod);
      }
    }
  });

  parentPort.postMessage({ kind: 'ready' } satisfies Event);
}

main(workerData).catch((err) => {
  console.error(err);
  process.exit(1);
});
