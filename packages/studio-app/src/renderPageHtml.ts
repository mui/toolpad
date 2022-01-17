import { ImportMap } from 'esinstall';

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

  const serializedImportMap = JSON.stringify(config.importMap);
  const serializedPreload = Object.values(config.importMap.imports)
    .map((url) => `<link rel="modulepreload" href="${url}" />`)
    .join('\n');

  const code = `
    <!DOCTYPE html>
    <html style="position: relative">
      <head>
        <meta charset="utf-8" />
        <title>Studio Sandbox</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div id="root"></div>

        <script type="importmap">
          ${serializedImportMap}
        </script>

        ${serializedPreload}

        <!-- ES Module Shims: Import maps polyfill for modules browsers without import maps support (all except Chrome 89+) -->
        <script async src="/web_modules/es-module-shims.js" type="module"></script>

        ${
          config.editor
            ? `
              <script type="module" src="/sandbox/index.js"></script>
              <script type="module" src="/editorRuntime/index.js"></script>
              `
            : ''
        }

        <script type="module" src="${config.entry}"></script>
      </body>
    </html>
  `;

  return { code };
}
