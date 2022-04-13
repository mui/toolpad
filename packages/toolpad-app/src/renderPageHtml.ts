import { ImportMap } from 'esinstall';
import { HTML_ID_APP_ROOT, MUI_X_PRO_LICENSE } from './constants';
import { escapeHtml } from './utils/strings';

export interface RenderHtmlConfig {
  importMap: ImportMap;
  entry: string;
  // whether we're in the context of an editor
  editor?: boolean;
}

export default function renderPageHtml(configInit: RenderHtmlConfig) {
  const config: RenderHtmlConfig = {
    editor: false,
    ...configInit,
  };

  const serializedImportMap = JSON.stringify(config.importMap, null, 2);
  const serializedPreload = Object.values(config.importMap.imports)
    .map((url) => `<link rel="modulepreload" href="${escapeHtml(url)}" />`)
    .join('\n');

  const code = `
    <!DOCTYPE html>
    <html style="position: relative">
      <head>
        <meta charset="utf-8" />
        <meta name="x-data-grid-pro-license" content="${MUI_X_PRO_LICENSE}" />
        <title>Toolpad Sandbox</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          #root {
            overflow: hidden; /* prevents margins from collapsing into root */
            min-height: 100vh;
          }
        </style>
      </head>
      <body>
        <div id="${HTML_ID_APP_ROOT}"></div>

        <script type="importmap">
          ${serializedImportMap}
        </script>

        ${serializedPreload}

        <!-- ES Module Shims: Import maps polyfill for modules browsers without import maps support (all except Chrome 89+) -->
        <script async src="/web_modules/es-module-shims.js" type="module"></script>

        ${
          config.editor
            ? `
              <script type="module" src="/reactDevtools/bootstrap.js"></script>
              <script type="module" src="/runtime/canvas.js"></script>
            `
            : `<script type="module" src="${escapeHtml(config.entry)}"></script>`
        }

        
      </body>
    </html>
  `;

  return { code };
}
