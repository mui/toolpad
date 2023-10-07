import * as path from 'path';
import * as url from 'node:url';
import { InlineConfig, Plugin, build } from 'vite';
import react from '@vitejs/plugin-react';
import { indent } from '@mui/toolpad-utils/strings';
import type { ComponentEntry } from './localMode';
import * as appDom from '../appDom';
import virtualFsPlugin, { replaceFiles } from './viteVirtualFsPlugin';
import { generateAppCode } from './codegen';
import { INITIAL_STATE_WINDOW_PROPERTY } from '../constants';

import.meta.url ??= url.pathToFileURL(__filename).toString();
const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const MAIN_ENTRY = '/main.tsx';
const CANVAS_ENTRY = '/canvas.tsx';

const componentsId = `virtual:toolpad:components.js`;
export const resolvedComponentsId = `\0${componentsId}`;

export interface GetHtmlContentParams {
  canvas: boolean;
}

export function getHtmlContent({ canvas }: GetHtmlContentParams) {
  const entryPoint = canvas ? CANVAS_ENTRY : MAIN_ENTRY;
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Toolpad</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
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

        <script type="module" src=${JSON.stringify(entryPoint)}></script>
      </body>
    </html>
  `;
}

interface ToolpadVitePluginParams {
  root: string;
  base: string;
  getComponents: () => Promise<ComponentEntry[]>;
}

function toolpadVitePlugin({ root, base, getComponents }: ToolpadVitePluginParams): Plugin {
  const resolvedRuntimeEntryPointId = `\0${MAIN_ENTRY}`;
  const resolvedCanvasEntryPointId = `\0${CANVAS_ENTRY}`;

  const getEntryPoint = (isCanvas: boolean) => `
    import { init, setComponents } from '@mui/toolpad/runtime';
    import components from ${JSON.stringify(componentsId)};
    ${isCanvas ? `import AppCanvas from '@mui/toolpad/canvas'` : ''}
    
    const initialState = window[${JSON.stringify(INITIAL_STATE_WINDOW_PROPERTY)}];

    setComponents(components);

    init({
      ${isCanvas ? `ToolpadApp: AppCanvas,` : ''}
      base: ${JSON.stringify(base)},
      initialState,
    })

    if (import.meta.hot) {
      // TODO: investigate why this doesn't work, see https://github.com/vitejs/vite/issues/12912
      import.meta.hot.accept(${JSON.stringify(componentsId)}, (newComponents) => {
        if (newComponents) {
          console.log('hot updating Toolpad components')
          setComponents(newComponents);
        }
      });
    }
  `;

  return {
    name: 'toolpad',

    async resolveId(id, importer) {
      if (id.endsWith('.html')) {
        return id;
      }
      if (id === MAIN_ENTRY) {
        return resolvedRuntimeEntryPointId;
      }
      if (id === CANVAS_ENTRY) {
        return resolvedCanvasEntryPointId;
      }
      if (id === componentsId) {
        return resolvedComponentsId;
      }
      if (importer === resolvedRuntimeEntryPointId || importer === resolvedComponentsId) {
        const newId = path.resolve(root, 'toolpad', id);
        return this.resolve(newId, importer);
      }
      return null;
    },

    async load(id) {
      if (id.endsWith('.html')) {
        // production build only
        return getHtmlContent({ canvas: false });
      }
      if (id === resolvedRuntimeEntryPointId) {
        return {
          code: getEntryPoint(false),
          map: null,
        };
      }
      if (id === resolvedCanvasEntryPointId) {
        return {
          code: getEntryPoint(true),
          map: null,
        };
      }
      if (id === resolvedComponentsId) {
        const components = await getComponents();

        const imports = components.map(({ name }) => `import ${name} from './components/${name}';`);

        const defaultExportProperties = components.map(
          ({ name }) => `${JSON.stringify(`codeComponent.${name}`)}: ${name}`,
        );

        const code = `
          ${imports.join('\n')}

          export default {
            ${indent(defaultExportProperties.join(',\n'), 2)}
          };
        `;

        return {
          code,
          map: null,
        };
      }
      return null;
    },
  };
}

export interface CreateViteConfigParams {
  outDir: string;
  root: string;
  dev: boolean;
  base: string;
  customServer?: boolean;
  plugins?: Plugin[];
  dom: appDom.AppDom;
  getComponents: () => Promise<ComponentEntry[]>;
}

export interface CreateViteConfigResult {
  viteConfig: InlineConfig;
  replaceDom: (newDom: appDom.AppDom) => void;
}

export function createViteConfig({
  outDir,
  root,
  dev,
  base,
  customServer,
  plugins = [],
  dom,
  getComponents,
}: CreateViteConfigParams): CreateViteConfigResult {
  const mode = dev ? 'development' : 'production';

  const codegen = generateAppCode(dom);
  const generatedFsPlugin = virtualFsPlugin(codegen.files, 'codegen-fs');

  return {
    viteConfig: {
      configFile: false,
      mode,
      build: {
        outDir,
        chunkSizeWarningLimit: Infinity,
        rollupOptions: {
          onwarn(warning, warn) {
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
              return;
            }
            warn(warning);
          },
        },
      },
      envFile: false,
      resolve: {
        alias: [
          {
            // FIXME(https://github.com/mui/material-ui/issues/35233)
            find: /^@mui\/icons-material\/(?!esm\/)([^/]*)/,
            replacement: '@mui/icons-material/esm/$1',
          },
          ...(process.env.EXPERIMENTAL_CODE_GENERATION
            ? [
                {
                  find: MAIN_ENTRY,
                  replacement: 'virtual:codegen-fs:/index.tsx',
                },
              ]
            : []),
        ],
      },
      server: {
        fs: {
          allow: [root, path.resolve(currentDirectory, '../../../../')],
        },
      },
      optimizeDeps: {
        include: [
          '@emotion/cache',
          '@emotion/react',
          '@mui/icons-material',
          '@mui/icons-material/ArrowDropDownRounded',
          '@mui/icons-material/DarkMode',
          '@mui/icons-material/Edit',
          '@mui/icons-material/Error',
          '@mui/icons-material/HelpOutlined',
          '@mui/icons-material/LightMode',
          '@mui/icons-material/OpenInNew',
          '@mui/icons-material/SettingsBrightnessOutlined',
          '@mui/lab',
          '@mui/material',
          '@mui/material/CircularProgress',
          '@mui/material/Button',
          '@mui/material/colors',
          '@mui/material/styles',
          '@mui/material/useMediaQuery',
          '@mui/utils',
          '@mui/utils/useEventCallback',
          '@mui/x-data-grid-pro',
          '@mui/x-date-pickers/AdapterDayjs',
          '@mui/x-date-pickers/DesktopDatePicker',
          '@mui/x-date-pickers/LocalizationProvider',
          '@mui/x-license-pro',
          '@tanstack/react-query',
          '@tanstack/react-query-devtools/build/lib/index.prod.js',
          'dayjs',
          'dayjs/locale/en',
          'dayjs/locale/fr',
          'dayjs/locale/nl',
          'fractional-indexing',
          'invariant',
          'lodash-es',
          'markdown-to-jsx',
          'nanoid/non-secure',
          'react',
          'react-dom/client',
          'react-error-boundary',
          'react-hook-form',
          'react-is',
          'react-router-dom',
          'react/jsx-dev-runtime',
          'react/jsx-runtime',
          'recharts',
          'superjson',
          'zod',
        ],
        exclude: [
          '@mui/toolpad-core',
          '@mui/toolpad/browser',
          '@mui/toolpad/runtime',
          '@mui/toolpad/canvas',
        ],
      },
      appType: 'custom',
      logLevel: 'info',
      root,
      plugins: [
        generatedFsPlugin,
        react(),
        toolpadVitePlugin({ root, base, getComponents }),
        ...plugins,
      ],
      base,
      define: {
        'process.env.NODE_ENV': `'${mode}'`,
        'process.env.BASE_URL': `'${base}'`,
        'process.env.TOOLPAD_CUSTOM_SERVER': `'${JSON.stringify(customServer)}'`,
      },
    },

    replaceDom: (newDom: appDom.AppDom) => {
      const newCode = generateAppCode(newDom);
      replaceFiles(generatedFsPlugin, newCode.files);
    },
  };
}

export interface ToolpadBuilderParams {
  outDir: string;
  getComponents: () => Promise<ComponentEntry[]>;
  root: string;
  base: string;
  dom: appDom.AppDom;
}

export async function buildApp({ root, base, getComponents, outDir, dom }: ToolpadBuilderParams) {
  const { viteConfig } = createViteConfig({ dev: false, root, base, outDir, getComponents, dom });
  await build(viteConfig);
}
