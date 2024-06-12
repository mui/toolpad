import * as path from 'path';
import * as url from 'node:url';
import * as fs from 'fs';
import type { InlineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { indent } from '@toolpad/utils/strings';
import * as appDom from '@toolpad/studio-runtime/appDom';
import type { ComponentEntry, PagesManifest } from './localMode';
import { INITIAL_STATE_WINDOW_PROPERTY } from '../constants';
import viteVirtualPlugin, { VirtualFileContent, replaceFiles } from './viteVirtualPlugin';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const pkgJsonContent = fs.readFileSync(path.resolve(currentDirectory, '../../package.json'), {
  encoding: 'utf-8',
});
const pkgJson = JSON.parse(pkgJsonContent);
const TOOLPAD_BUILD = process.env.GIT_SHA1?.slice(0, 7) || 'dev';

const MAIN_ENTRY = '/main.tsx';
const EDITOR_ENTRY = '/editor.tsx';

function getHtmlContent(entry: string) {
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
    
        <!-- __TOOLPAD_SCRIPTS__ -->

        <script type="module" src=${JSON.stringify(entry)}></script>
      </body>
    </html>
  `;
}

function getAppHtmlContent() {
  return getHtmlContent(MAIN_ENTRY);
}

export function getEditorHtmlContent() {
  return getHtmlContent(EDITOR_ENTRY);
}

function toolpadStudioVitePlugin(): Plugin {
  return {
    name: 'toolpad-studio',

    async resolveId(id) {
      if (id.endsWith('.html')) {
        return id;
      }
      return null;
    },

    async load(id) {
      if (id.endsWith('index.html')) {
        // production build only
        return getAppHtmlContent();
      }

      if (id.endsWith('editor.html')) {
        // production build only
        return getEditorHtmlContent();
      }
      return null;
    },
  };
}

export interface CreateViteConfigParams {
  toolpadDevMode: boolean;
  outDir: string;
  root: string;
  dev: boolean;
  base: string;
  customServer?: boolean;
  plugins?: Plugin[];
  getComponents: () => Promise<ComponentEntry[]>;
  loadDom: () => Promise<appDom.AppDom>;
  getPagesManifest: () => Promise<PagesManifest>;
}

export interface CreateViteConfigResult {
  reloadComponents: () => Promise<void>;
  viteConfig: InlineConfig;
}

export async function createViteConfig({
  toolpadDevMode,
  outDir,
  root,
  dev,
  base,
  customServer,
  plugins = [],
  getComponents,
  loadDom,
  getPagesManifest,
}: CreateViteConfigParams): Promise<CreateViteConfigResult> {
  const mode = dev ? 'development' : 'production';

  const initialDom = await loadDom();
  const plan = appDom.getPlan(initialDom);

  const getEntryPoint = (target: 'prod' | 'editor') => {
    const isEditor = target === 'editor';

    const componentsId = 'virtual:toolpad-files:components.tsx';

    return `
import { init, setComponents } from '@toolpad/studio/entrypoint';
import components from ${JSON.stringify(componentsId)};
${isEditor ? `import ToolpadEditor from '@toolpad/studio/editor'` : ''}

// importing monaco to get around module ordering issues in esbuild
import 'monaco-editor';

window.MonacoEnvironment = {
  getWorker: async (_, label) => {
    // { type: 'module' } is supported in firefox but behind feature flag:
    // you have to enable it manually via about:config and set dom.workers.modules.enabled to true.
    if (label === 'typescript') {
      const { default: TsWorker } = await import('monaco-editor/esm/vs/language/typescript/ts.worker?worker');
      return new TsWorker();
    }
    if (label === 'json') {
      const { default: JsonWorker } = await import('monaco-editor/esm/vs/language/json/json.worker?worker');
      return new JsonWorker();
    }
    if (label === 'html') {
      const { default: HtmlWorker } = await import('monaco-editor/esm/vs/language/html/html.worker?worker');
      return new HtmlWorker();
    }
    if (label === 'css') {
      const { default: CssWorker } = await import('monaco-editor/esm/vs/language/css/css.worker?worker');
      return new CssWorker();
    }
    if (label === 'editorWorkerService') {
      const { default: EditorWorker } = await import('monaco-editor/esm/vs/editor/editor.worker?worker');
      return new EditorWorker();
    }
    throw new Error(\`Failed to resolve worker with label "\${label}"\`);
  },
} as monaco.Environment;

const initialState = window[${JSON.stringify(INITIAL_STATE_WINDOW_PROPERTY)}];

setComponents(components);

init({
  ${isEditor ? `ToolpadApp: ToolpadEditor,` : ''}
  base: ${JSON.stringify(base)},
  initialState,
})

if (import.meta.hot) {
  // TODO: investigate why this doesn't work, see https://github.com/vitejs/vite/issues/12912
  import.meta.hot.accept(
    [${JSON.stringify(componentsId)}],
    (newComponents) => {
    if (newComponents) {
      console.log('hot updating Toolpad Studio components')
      setComponents(
        newComponents ?? components,
      );
    }
  });
}
`;
  };

  const createComponentsFile = async () => {
    const components = await getComponents();

    const imports = components.map(
      ({ name }) => `import ${name} from 'toolpad-user-project:./components/${name}';`,
    );

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
  };

  const virtualFiles = new Map<string, VirtualFileContent>([
    ['main.tsx', getEntryPoint('prod')],
    ['editor.tsx', getEntryPoint('editor')],
    ['components.tsx', await createComponentsFile()],
    ['pages-manifest.json', JSON.stringify(await getPagesManifest(), null, 2)],
  ]);

  const virtualToolpadFiles = viteVirtualPlugin(virtualFiles, 'toolpad-files');

  return {
    reloadComponents: async () => {
      const newFiles = new Map(virtualFiles);
      newFiles.set('components.tsx', await createComponentsFile());
      replaceFiles(virtualToolpadFiles, newFiles);
    },
    viteConfig: {
      configFile: false,
      mode,
      build: {
        outDir,
        emptyOutDir: true,
        chunkSizeWarningLimit: Infinity,
        rollupOptions: {
          input: {
            index: path.resolve(currentDirectory, './index.html'),
            ...(dev ? { editor: path.resolve(currentDirectory, './editor.html') } : {}),
          },
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
        dedupe: ['@mui/material'],
        alias: [
          {
            // FIXME(https://github.com/mui/material-ui/issues/35233)
            find: /^@mui\/icons-material\/(?!esm\/)([^/]*)/,
            replacement: '@mui/icons-material/esm/$1',
          },
          {
            find: /^toolpad-user-project:(.*)$/,
            replacement: `${root}/$1`,
          },
          {
            find: MAIN_ENTRY,
            replacement: 'virtual:toolpad-files:main.tsx',
          },
          {
            find: '@toolpad/studio',
            replacement: toolpadDevMode
              ? // load source
                path.resolve(currentDirectory, '../../src/exports')
              : // load compiled
                path.resolve(currentDirectory, '../exports'),
          },
          ...(dev
            ? [
                {
                  find: EDITOR_ENTRY,
                  replacement: 'virtual:toolpad-files:editor.tsx',
                },
                {
                  find: 'vm',
                  replacement: 'vm-browserify',
                },
              ]
            : []),
        ],
      },
      optimizeDeps: {
        include: [
          ...(dev
            ? [
                'perf-cascade',
                'monaco-editor',
                'monaco-editor/esm/vs/basic-languages/javascript/javascript',
                'monaco-editor/esm/vs/basic-languages/typescript/typescript',
                'monaco-editor/esm/vs/basic-languages/markdown/markdown',
              ]
            : ['@toolpad/studio/entrypoint', '@toolpad/studio/editor']),
        ],
      },
      appType: 'custom',
      logLevel: 'info',
      root: currentDirectory,
      plugins: [toolpadStudioVitePlugin(), virtualToolpadFiles, react(), ...plugins],
      base,
      define: {
        'process.env.NODE_ENV': `'${mode}'`,
        'process.env.BASE_URL': `'${base}'`,
        'process.env.TOOLPAD_CUSTOM_SERVER': `'${JSON.stringify(customServer)}'`,
        'process.env.TOOLPAD_VERSION': JSON.stringify(pkgJson.version),
        'process.env.TOOLPAD_BUILD': JSON.stringify(TOOLPAD_BUILD),
        'process.env.TOOLPAD_PLAN': JSON.stringify(plan),
      },
    },
  };
}

export interface ToolpadBuilderParams {
  outDir: string;
  getComponents: () => Promise<ComponentEntry[]>;
  loadDom: () => Promise<appDom.AppDom>;
  getPagesManifest: () => Promise<PagesManifest>;
  root: string;
  base: string;
}

export async function buildApp({
  root,
  base,
  getComponents,
  getPagesManifest,
  loadDom,
  outDir,
}: ToolpadBuilderParams) {
  const { viteConfig } = await createViteConfig({
    toolpadDevMode: false,
    dev: false,
    root,
    base,
    outDir,
    getComponents,
    getPagesManifest,
    loadDom,
  });
  const vite = await import('vite');
  await vite.build(viteConfig);
}
