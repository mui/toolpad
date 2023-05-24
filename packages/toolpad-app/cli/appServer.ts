import invariant from 'invariant';
import { createServer, Plugin } from 'vite';
import {
  getHtmlContent,
  postProcessHtml,
  createViteConfig,
  resolvedComponentsId,
} from '../src/server/toolpadAppBuilder';
import config from '../src/config';
import { loadDomFromDisk } from '../src/server/localMode';

function devServerPlugin(): Plugin {
  return {
    name: 'toolpad-dev-server',

    async configureServer(viteServer) {
      return () => {
        viteServer.middlewares.use('/', async (req, res, next) => {
          invariant(req.url, 'request must have a url');
          const url = new URL(req.url, 'http://x');
          const canvas = url.searchParams.get('toolpad-display') === 'canvas';

          try {
            const dom = await loadDomFromDisk();

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
  root: string;
  base: string;
}

export async function createDevServer({ root, base }: ToolpadAppDevServerParams) {
  const devServer = await createServer(
    createViteConfig({
      dev: true,
      root,
      base,
      plugins: [devServerPlugin()],
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

async function main() {
  invariant(
    process.env.NODE_ENV === 'development',
    'The dev server must be started with NODE_ENV=development',
  );
  invariant(!!process.env.TOOLPAD_PROJECT_DIR, 'A project root must be defined');
  invariant(!!process.env.TOOLPAD_PORT, 'A port must be defined');
  invariant(!!process.env.TOOLPAD_BASE, 'A base path must be defined');
  invariant(process.send, 'Process must be spawned with an IPC channel');

  const app = await createDevServer({
    root: process.env.TOOLPAD_PROJECT_DIR,
    base: process.env.TOOLPAD_BASE,
  });

  await app.listen(Number(process.env.TOOLPAD_PORT));

  process.on('message', (msg: Command) => {
    if (msg.kind === 'reload-components') {
      const mod = app.moduleGraph.getModuleById(resolvedComponentsId);
      if (mod) {
        app.reloadModule(mod);
      }
    }
  });

  process.send({ kind: 'ready' } satisfies Event);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
