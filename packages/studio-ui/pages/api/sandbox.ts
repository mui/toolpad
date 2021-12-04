import { ImportMap } from 'esinstall';
import { NextApiHandler } from 'next';
import * as path from 'path';
import importMap from '../../public/web_modules/import-map.json';

function rewriteImports(map: ImportMap): ImportMap {
  return {
    ...map,
    imports: Object.fromEntries(
      Object.entries(map.imports).map(([specifier, source]) => {
        return [specifier, path.resolve('/web_modules/', source)];
      }),
    ),
  };
}

async function createSandboxHtml(entry: string = '/sandbox/main/index.js'): Promise<string> {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Studio Sandbox</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          html,
          body {
            margin: 0;
          }

          #root {
            overflow: auto;
          }
        </style>
      </head>
      <body>
      <div id="root"></div>
        <script type="importmap">
          ${JSON.stringify(rewriteImports(importMap))}
        </script>

        <!-- ES Module Shims: Import maps polyfill for modules browsers without import maps support (all except Chrome 89+) -->
        <script async src="/web_modules/es-module-shims.js" type="module"></script>

        <script type="module" src="/sandbox/main/index.js"></script>
        <script type="module" src="${entry}"></script>
      </body>
    </html>
  `;
}

export default (async (req, res) => {
  res.setHeader('content-type', 'text/html');
  res.send(await createSandboxHtml(req.query.entry as string));
}) as NextApiHandler<string>;
