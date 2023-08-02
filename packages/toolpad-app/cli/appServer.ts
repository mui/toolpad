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
}

export async function createDevServer({ config, root, base }: ToolpadAppDevServerParams) {
  const devServer = await createServer(
    createViteConfig({
      dev: true,
      root,
      base,
      plugins: [devServerPlugin(root, config)],
    }),
  );

  return devServer;
}

export type Command = {
  kind: 'reload-components';
};

export type Event = {
  kind: 'ready';
};

export interface MainParams {
  base: string;
  root: string;
  port: number;
  config: RuntimeConfig;
}

export async function main({ base, config, root, port }: MainParams) {
  const app = await createDevServer({ config, root, base });

  await app.listen(port);

  process.on('message', (msg: Command) => {
    if (msg.kind === 'reload-components') {
      const mod = app.moduleGraph.getModuleById(resolvedComponentsId);
      if (mod) {
        app.reloadModule(mod);
      }
    }
  });

  invariant(process.send, 'Process must be spawned with an IPC channel');
  process.send({ kind: 'ready' } satisfies Event);
}

invariant(!!process.env.TOOLPAD_PROJECT_DIR, 'A project root must be defined');
invariant(!!process.env.TOOLPAD_RUNTIME_CONFIG, 'A runtime config must be defined');
invariant(!!process.env.TOOLPAD_PORT, 'A port must be defined');
invariant(!!process.env.TOOLPAD_BASE, 'A base path must be defined');

main({
  config: JSON.parse(process.env.TOOLPAD_RUNTIME_CONFIG) as RuntimeConfig,
  base: process.env.TOOLPAD_BASE,
  root: process.env.TOOLPAD_PROJECT_DIR,
  port: Number(process.env.TOOLPAD_PORT),
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
