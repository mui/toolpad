import { createServer, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import * as fs from 'fs/promises';
import serializeJavascript from 'serialize-javascript';
import { Router } from 'express';
import { MUI_X_PRO_LICENSE, RUNTIME_CONFIG_WINDOW_PROPERTY } from '../constants';
import config from '../config';
import createRuntimeState from '../createRuntimeState';
import { loadDom } from './data';
import * as appDom from '../appDom';
import { indent } from '../utils/strings';

function virtualModules(root: string): Plugin {
  const entryPointId = '/src/main.tsx';
  const resolvedEntryPointId = `\0${entryPointId}`;

  const componentsId = `virtual:components`;
  const resolvedComponentsId = `\0${componentsId}`;

  return {
    name: 'virtual-modules',

    async resolveId(id, importer) {
      if (id === entryPointId) {
        return resolvedEntryPointId;
      }
      if (id === componentsId) {
        return resolvedComponentsId;
      }
      if (importer === resolvedEntryPointId || importer === resolvedComponentsId) {
        return path.resolve(root, 'toolpad', id);
      }
      return null;
    },

    async load(id) {
      if (id === resolvedEntryPointId) {
        return {
          code: `
            import { init } from '@mui/toolpad/runtime';
            import { LicenseInfo } from '@mui/x-data-grid-pro';
            import components from 'virtual:components';
            
            LicenseInfo.setLicenseKey(${JSON.stringify(MUI_X_PRO_LICENSE)});
            
            const initialState = window.initialToolpadState;

            init(components, initialState)
          `,
          map: null,
        };
      }
      if (id === resolvedComponentsId) {
        const dom = await loadDom();

        const app = appDom.getApp(dom);
        const { codeComponents = [] } = appDom.getChildNodes(dom, app);

        const imports = codeComponents.map(
          ({ name }) => `import ${name} from './components/${name}';`,
        );

        const defaultExportProperties = codeComponents.map(
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

export async function createHandler(root: string) {
  const toolpadRoot = path.resolve(__dirname, '../../src/server/app');
  const server = await createServer({
    configFile: false,
    server: {
      middlewareMode: true,
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
    plugins: [react(), virtualModules(root)],
    base: '/app',
    define: {
      'process.env': {},
    },
  });

  const router = Router();

  router.use(server.middlewares);

  router.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const dom = await loadDom();
      const serializedConfig = serializeJavascript(config, { ignoreFunction: true });
      const initialState = createRuntimeState({ dom });
      const serializedInitialState = serializeJavascript(initialState, {
        ignoreFunction: true,
      });

      const template = await fs.readFile(path.resolve(toolpadRoot, 'index.html'), 'utf-8');
      let html = await server.transformIndexHtml(url, template);
      html = html.replaceAll(
        `__TOOLPAD_CONFIG__`,
        `<script>window[${JSON.stringify(
          RUNTIME_CONFIG_WINDOW_PROPERTY,
        )}] = ${serializedConfig}</script>`,
      );
      html = html.replaceAll(
        `__TOOLPAD_RUNTIME_STATE__`,
        `<script>window.initialToolpadState = ${serializedInitialState}</script>`,
      );
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
