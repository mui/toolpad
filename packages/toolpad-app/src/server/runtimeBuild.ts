import { NodeId } from '@mui/toolpad-core';
import * as esbuild from 'esbuild';
import * as path from 'path';
import serializeJavascript from 'serialize-javascript';
import * as appDom from '../appDom';
import { APP_ID_LOCAL_MARKER, MUI_X_PRO_LICENSE } from '../constants';
import createRuntimeState from '../createRuntimeState';
import { getToolpadComponents } from '../toolpadComponents';
import { loadLocalDomFromFile } from './localMode';
import projectRoot from './projectRoot';

async function createMain(dom: appDom.AppDom) {
  const initialState = createRuntimeState({ appId: APP_ID_LOCAL_MARKER, dom });
  const serializedInitialState = serializeJavascript(initialState, {
    ignoreFunction: true,
  });

  const catalog = getToolpadComponents(dom);

  // TODO: this can be optimized by filtering only the components that are used in the dom
  const properties = Object.entries(catalog)
    .map(([id, component]) => {
      if (!component) {
        return '';
      }
      if (component.builtIn) {
        return `${JSON.stringify(id)}: builtIns[${JSON.stringify(component.builtIn)}]`;
      }
      if (component.system) {
        return `${JSON.stringify(id)}: builtIns[${JSON.stringify(id)}]`;
      }
      if (component.codeComponentId) {
        return `${JSON.stringify(id)}: loadCodeComponent(() => import('toolpad:components/${
          component.codeComponentId
        }.tsx'))`;
      }
      return '';
    })
    .join(',\n');

  const componentImports = `{${properties}}`;

  return `
    import * as React from 'react';
    import * as ReactDOM from 'react-dom/client';
    import { LicenseInfo } from '@mui/x-data-grid-pro';
    import AppCanvas from './src/canvas';
    import { ensureToolpadComponent } from './src/runtime/loadCodeComponent';
    import * as builtIns from '@mui/toolpad-components';
    
    LicenseInfo.setLicenseKey(${JSON.stringify(MUI_X_PRO_LICENSE)});
    
    const initialState = ${serializedInitialState}
    
    async function loadCodeComponent(loadModule) {
      const { default: CodeComponent } = await loadModule();
      return ensureToolpadComponent(CodeComponent);
    }
    
    async function loadCodeComponents() {
      return Object.fromEntries(await Promise.all(Object.entries(${componentImports}).map(async ([key, value]) => [key, await value])));
    }
    
    const rootNode = document.createElement('div');
    document.body.append(rootNode);
    const root = ReactDOM.createRoot(rootNode);
    loadCodeComponents().then(catalog => {
      console.log(catalog)
      root.render(<AppCanvas catalog={catalog} basename='/api/runtime/app' initialState={initialState} />)
    })
  `;
}

interface BuilderOptions {
  filePath: string;
  dev?: boolean;
}

export async function createBuilder({ filePath, dev }: BuilderOptions) {
  const dom = await loadLocalDomFromFile(filePath);

  const userProjectRoot = path.dirname(filePath);

  const toolpadPLugin: esbuild.Plugin = {
    name: 'toolpad',
    setup(build) {
      build.onResolve({ filter: /^toolpad:/ }, (args) => ({
        path: args.path.slice('toolpad:'.length),
        namespace: 'toolpad',
      }));

      build.onLoad({ filter: /.*/, namespace: 'toolpad' }, async (args) => {
        if (args.path === 'main.tsx') {
          return {
            loader: 'tsx',
            contents: await createMain(dom),
            resolveDir: projectRoot,
            watchFiles: [filePath],
          };
        }

        const component = /^components\/([^.]+)\.tsx$/.exec(args.path);

        if (component) {
          const id = component[1];
          const componentNode = appDom.getMaybeNode(dom, id as NodeId, 'codeComponent');

          if (!componentNode) {
            throw new Error(`Can't resolve component "${id}" for toolpad namespace`);
          }

          return {
            loader: 'tsx',
            contents: componentNode.attributes.code.value,
            watchFiles: [filePath],
            resolveDir: userProjectRoot,
          };
        }

        throw new Error(`Can't resolve "${args.path}" for toolpad namespace`);
      });

      build.onEnd((args) => {
        // TODO: use for hot reloading
        // eslint-disable-next-line no-console
        console.log(`Rebuild: ${args.errors.length} error(s), ${args.warnings.length} warning(s)`);
      });
    },
  };

  const ctx = await esbuild.context({
    absWorkingDir: projectRoot,
    entryPoints: ['toolpad:main.tsx'],
    plugins: [toolpadPLugin],
    write: false,
    bundle: true,
    outfile: '/index.js',
    target: 'es2022',
    jsx: 'transform',
    jsxDev: dev,
    minify: !dev,
    tsconfig: './tsconfig.esbuild.json',
  });

  const result = await ctx.rebuild();

  return {
    async watch() {
      await ctx.watch();
    },
    getResult() {
      return result;
    },
  };
}
