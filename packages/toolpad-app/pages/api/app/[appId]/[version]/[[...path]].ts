import { NextApiHandler } from 'next';
import serializeJavascript from 'serialize-javascript';
import { asArray } from '../../../../../src/utils/collections';
import {
  HTML_ID_APP_ROOT,
  MUI_X_PRO_LICENSE,
  HTML_ID_TOOLPAD_APP_RENDER_PARAMS,
} from '../../../../../src/constants';
import getImportMap from '../../../../../src/getImportMap';
import { escapeHtml } from '../../../../../src/utils/strings';
import { loadVersionedDom, parseVersion } from '../../../../../src/server/data';
import { VersionOrPreview } from '../../../../../src/types';
import { RenderParams } from '../../../../../runtime/pageEditor/renderToolpadApp';
import { getToolpadComponents } from '../../../../../src/toolpadComponents';
import * as appDom from '../../../../../src/appDom';

export interface RenderAppHtmlOptions {
  version: VersionOrPreview;
  basename: string;
}

export async function renderAppHtml(
  appId: string,
  { version = 'preview', basename = `/app/${appId}/${version}` }: RenderAppHtmlOptions,
) {
  const dom = await loadVersionedDom(appId, version);

  const importMap = getImportMap();
  const serializedImportMap = JSON.stringify(importMap, null, 2);
  const serializedPreload = Object.values(importMap.imports)
    .map((url) => `<link rel="modulepreload" href="${escapeHtml(url)}" />`)
    .join('\n');

  const renderParams: RenderParams = {
    editor: true,
    dom: appDom.createRenderTree(dom),
    appId,
    basename,
    version,
    components: getToolpadComponents(appId, version, dom),
  };

  return `
    <!DOCTYPE html>
    <html style="position: relative">
      <head>
        <meta charset="utf-8" />
        <meta name="x-data-grid-pro-license" content="${MUI_X_PRO_LICENSE}" />
        <title>Toolpad</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          #${HTML_ID_APP_ROOT} {
            overflow: auto; /* prevents margins from collapsing into root */
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
          renderParams.editor
            ? '<script type="module" src="/reactDevtools/bootstrap.js"></script>'
            : ''
        }

        <script type="application/json" id="${HTML_ID_TOOLPAD_APP_RENDER_PARAMS}">
          ${serializeJavascript(JSON.parse(JSON.stringify(renderParams)))}
        </script>

        <script type="module" src="/runtime/pageEditor.js"></script>
      </body>
    </html>
  `;
}

export default (async (req, res) => {
  const [appId] = asArray(req.query.appId);
  const version = parseVersion(req.query.version);
  if (!version) {
    res.status(404).end();
    return;
  }

  res.setHeader('content-type', 'text/html');
  res.send(
    await renderAppHtml(appId, {
      version,
      basename: `/app/${appId}/${version}`,
    }),
  );
}) as NextApiHandler<string>;
