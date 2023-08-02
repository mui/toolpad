import invariant from 'invariant';
import { createServer, Plugin } from 'vite';
import {
  getHtmlContent,
  postProcessHtml,
  createViteConfig,
  resolvedComponentsId,
} from '../src/server/toolpadAppBuilder';
import type { RuntimeConfig } from '../src/config';
import { loadDomFromDisk } from '../src/server/localMode';
import * as appDom from '../src/appDom';

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
            const dom = await loadDomFromDisk(root);

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
  config: RuntimeConfig;
  root: string;
  base: string;
  dom: appDom.AppDom;
}

export async function createDevServer({ config, root, base, dom }: ToolpadAppDevServerParams) {
  const { viteConfig, updateDom } = createViteConfig({
    dev: true,
    root,
    base,
    dom,
    plugins: [devServerPlugin(root, config)],
  });
  const devServer = await createServer(viteConfig);

  return { devServer, updateDom };
}

export type Command =
  | {
      kind: 'reload-components';
    }
  | {
      kind: 'change-dom';
      dom: appDom.AppDom;
    };

export type Event = {
  kind: 'ready';
};

export interface ServerConfig {
  base: string;
  root: string;
  port: number;
  config: RuntimeConfig;
  initialDom: appDom.AppDom;
}

export async function main({ base, config, root, port, initialDom }: ServerConfig) {
  const { devServer, updateDom } = await createDevServer({ config, root, base, dom: initialDom });

  await devServer.listen(port);

  process.on('message', (msg: Command) => {
    switch (msg.kind) {
      case 'reload-components': {
        const mod = devServer.moduleGraph.getModuleById(resolvedComponentsId);
        if (mod) {
          devServer.reloadModule(mod);
        }
        break;
      }
      case 'change-dom': {
        updateDom(msg.dom);
        break;
      }
      default:
        throw new Error(`Unknown command ${msg}`);
    }
  });

  invariant(process.send, 'Process must be spawned with an IPC channel');
  process.send({ kind: 'ready' } satisfies Event);
}

invariant(!!process.env.SERVER_CONFIG, 'A server config must be defined');

main(JSON.parse(process.env.SERVER_CONFIG)).catch((err) => {
  console.error(err);
  process.exit(1);
});
