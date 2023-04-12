import { InlineConfig, Plugin, build } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { Server } from 'http';
import serializeJavascript from 'serialize-javascript';
import { MUI_X_PRO_LICENSE, RUNTIME_CONFIG_WINDOW_PROPERTY } from '../constants';
import { indent } from '../utils/strings';
import { getComponents, getAppOutputFolder } from './localMode';
import { RuntimeConfig } from '../config';
import * as appDom from '../appDom';
import createRuntimeState from '../createRuntimeState';

export interface GetHtmlContentParams {
  canvas: boolean;
}

export function getHtmlContent({ canvas }: GetHtmlContentParams) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Toolpad</title>
      </head>
      <body>
        <div id="root"></div>

        ${
          canvas
            ? `
              <script>
                // Add the data-toolpad-canvas attribute to the canvas iframe element
                if (window.frameElement?.dataset.toolpadCanvas) {
                  var script = document.createElement('script');
                  script.src = '/reactDevtools/bootstrap.global.js';
                  document.write(script.outerHTML);
                }
              </script>
            `
            : ''
        }
    
        <!-- __TOOLPAD_SCRIPTS__ -->

        <script type="module" src="/main.tsx"></script>
      </body>
    </html>
  `;
}

export interface PostProcessHtmlParams {
  config: RuntimeConfig;
  dom: appDom.AppDom;
}

export function postProcessHtml(html: string, { config, dom }: PostProcessHtmlParams): string {
  const serializedConfig = serializeJavascript(config, { ignoreFunction: true });
  const initialState = createRuntimeState({ dom });
  const serializedInitialState = serializeJavascript(initialState, {
    ignoreFunction: true,
  });

  const toolpadScripts = [
    `<script>window[${JSON.stringify(
      RUNTIME_CONFIG_WINDOW_PROPERTY,
    )}] = ${serializedConfig}</script>`,
    `<script>window.initialToolpadState = ${serializedInitialState}</script>`,
  ];

  return html.replaceAll(`<!-- __TOOLPAD_SCRIPTS__ -->`, toolpadScripts.join('\n'));
}

interface ToolpadVitePluginParams {
  root: string;
  base: string;
  canvas: boolean;
}

function toolpadVitePlugin({ root, base, canvas }: ToolpadVitePluginParams): Plugin {
  const resolvedIndexHtmlId = `\0virtual:index.html`;

  const entryPointId = '/main.tsx';
  const resolvedEntryPointId = `\0${entryPointId}`;

  const componentsId = `virtual:components`;
  const resolvedComponentsId = `\0${componentsId}`;

  return {
    name: 'toolpad',

    async resolveId(id, importer) {
      if (id.endsWith(`.html`)) {
        return id;
      }
      if (id === entryPointId) {
        return resolvedEntryPointId;
      }
      if (id === componentsId) {
        return resolvedComponentsId;
      }
      if (
        importer === resolvedEntryPointId ||
        importer === resolvedComponentsId ||
        importer === resolvedIndexHtmlId
      ) {
        return path.resolve(root, 'toolpad', id);
      }
      return null;
    },

    async load(id) {
      if (id.endsWith(`.html`)) {
        return getHtmlContent({ canvas });
      }
      if (id === resolvedEntryPointId) {
        return {
          code: `
            import { init } from '@mui/toolpad/runtime';
            import { LicenseInfo } from '@mui/x-data-grid-pro';
            import components from 'virtual:components';
            
            LicenseInfo.setLicenseKey(${JSON.stringify(MUI_X_PRO_LICENSE)});
            
            const initialState = window.initialToolpadState;

            init({
              base: ${JSON.stringify(base)},
              components,
              initialState,
            })
          `,
          map: null,
        };
      }
      if (id === resolvedComponentsId) {
        const components = await getComponents(root);

        const imports = components.map(({ name }) => `import ${name} from './components/${name}';`);

        const defaultExportProperties = components.map(
          ({ name }) => `${JSON.stringify(`codeComponent.${name}`)}: ${name}`,
        );

        return {
          code: `
            ${imports.join('\n')}

            export default {
              ${indent(defaultExportProperties.join(',\n'), 2)}
            }
          `,
          map: null,
        };
      }
      return null;
    },
  };
}

export interface CreateViteConfigParams {
  server?: Server;
  dev: boolean;
  root: string;
  base: string;
  canvas: boolean;
}

export function createViteConfig({
  root,
  dev,
  base,
  canvas,
  server,
}: CreateViteConfigParams): InlineConfig {
  return {
    configFile: false,
    mode: dev ? 'development' : 'production',
    build: {
      outDir: getAppOutputFolder(root),
    },
    server: {
      middlewareMode: true,
      hmr: {
        server,
      },
      fs: {
        allow: [root, path.resolve(__dirname, '../../../../')],
      },
    },
    appType: 'custom',
    logLevel: 'warn',
    root,
    resolve: {
      alias: {},
    },
    plugins: [react(), toolpadVitePlugin({ root, base, canvas })],
    base,
    define: {
      'process.env': {},
    },
  };
}

export interface ToolpadBuilderParams {
  root: string;
  base: string;
}

export async function buildApp({ root, base }: ToolpadBuilderParams) {
  await build(createViteConfig({ dev: false, root, base, canvas: false }));
}
