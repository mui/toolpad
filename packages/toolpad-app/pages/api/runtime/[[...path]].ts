import { asArray } from '@mui/toolpad-core/utils/collections';
import { NextApiHandler } from 'next';
import serializeJavascript from 'serialize-javascript';
import config from '../../../src/config';
import { RUNTIME_CONFIG_WINDOW_PROPERTY } from '../../../src/constants';
import { getConfigFilePath } from '../../../src/server/localMode';
import { createBuilder } from '../../../src/server/runtimeBuild';

const BASE = '/api/runtime';

let builderPromise: ReturnType<typeof createBuilder> | undefined;

declare module globalThis {
  // Used to detect old builders to be cleaned up after HMR
  let internalBuilderPromise: ReturnType<typeof createBuilder> | undefined;
}

async function getBuilder() {
  if (!builderPromise) {
    // Not initialized yet, either first run, or after HMR

    const oldBuilderPromise = globalThis.internalBuilderPromise;
    builderPromise = (async () => {
      if (oldBuilderPromise) {
        // This module was loaded as part of HMR, cleaning up the previous bulder first
        const oldBuilder = await oldBuilderPromise;
        await oldBuilder.dispose();
      }

      const builder = await createBuilder({
        filePath: getConfigFilePath(),
        dev: true,
      });

      await builder.watch();
      return builder;
    })();
    globalThis.internalBuilderPromise = builderPromise;
  }

  return builderPromise;
}

const routes = new Map<RegExp, NextApiHandler<string>>([
  [
    /^\/app/,
    async (req, res) => {
      const serializedConfig = serializeJavascript(config, { ignoreFunction: true });

      res.setHeader('content-type', 'text/html');
      res.setHeader('x-frame-options', 'SAMEORIGIN');

      res.send(`
        <html>
          <head>
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
            />

            <script>
              // Add the data-toolpad-canvas attribute to the canvas iframe element
              if (window.frameElement?.dataset.toolpadCanvas){
                var script = document.createElement('script');
                script.src = '/reactDevtools/bootstrap.js';
                document.write(script.outerHTML);
              }
              
              window[${JSON.stringify(RUNTIME_CONFIG_WINDOW_PROPERTY)}] = ${serializedConfig}
            </script>
          </head>
          <body>
            <script async src="${BASE}/index.js"></script>
          </body>
        </html>
      `);
    },
  ],

  [
    /^\/index\.js$/,
    async (req, res) => {
      const builder = await getBuilder();
      const output = builder.getResult();

      const indexFile = output.outputFiles.find((file) => file.path === '/index.js');

      if (indexFile) {
        res.setHeader('content-type', 'application/javascript; charset=utf-8');
        res.write(indexFile.contents);
        res.end();
        return;
      }

      res.status(404);
      res.end();
    },
  ],
]);

function getHandler(path: string): NextApiHandler<string> | null {
  for (const [matcher, handler] of routes) {
    if (matcher.test(path)) {
      return handler;
    }
  }
  return null;
}

const apiHandler = (async (req, res) => {
  const path: string = `/${asArray(req.query.path).join('/')}`;
  const handler = getHandler(path);
  if (handler) {
    await handler(req, res);
  } else {
    res.status(404);
    res.end();
  }
}) as NextApiHandler<string>;

export default apiHandler;
