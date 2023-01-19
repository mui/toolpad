import { asArray } from '@mui/toolpad-core/utils/collections';
import { NextApiHandler } from 'next';
import serializeJavascript from 'serialize-javascript';
import config from '../../../src/config';
import { RUNTIME_CONFIG_WINDOW_PROPERTY } from '../../../src/constants';
import { loadLocalDom } from '../../../src/server/localMode';
import { createBuilder } from '../../../src/server/runtimeBuild';

const BASE = '/api/runtime';

let builderPromise: ReturnType<typeof createBuilder> | undefined;

async function getBuilder() {
  if (!builderPromise) {
    const initialDom = await loadLocalDom();
    builderPromise = createBuilder(initialDom);
  }
  return builderPromise;
}

const routes = new Map<RegExp, NextApiHandler<string>>([
  [
    /^\/app/,
    async (req, res) => {
      const serializedConfig = serializeJavascript(config, { ignoreFunction: true });

      res.setHeader('content-type', 'text/html');
      res.send(`
        <html>
          <body>
            <script>
              window[${JSON.stringify(RUNTIME_CONFIG_WINDOW_PROPERTY)}] = ${serializedConfig}
            </script>
            <script src="${BASE}/index.js"></script>
          </body>
        </html>
      `);
    },
  ],

  [
    /^\/index\.js/,
    async (req, res) => {
      const builder = await getBuilder();
      const output = builder.getResult();
      const content = output.outputFiles[0].text;
      res.setHeader('content-type', 'application/javascript');
      res.send(content);
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
