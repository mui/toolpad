import * as esbuild from 'esbuild';
import serializeJavascript from 'serialize-javascript';
import * as appDom from '../appDom';
import { MUI_X_PRO_LICENSE } from '../constants';
import createRuntimeState from '../createRuntimeState';
import { loadLocalDomFromFile } from './localMode';
import projectRoot from './projectRoot';

async function createMain(dom: appDom.AppDom) {
  const initialState = createRuntimeState({ appId: '', dom });
  const serializedInitialState = serializeJavascript(initialState, {
    ignoreFunction: true,
  });

  return `
    import * as React from 'react';
    import * as ReactDOM from 'react-dom/client';
    import { LicenseInfo } from '@mui/x-data-grid-pro';
    import AppCanvas from './src/canvas';

    LicenseInfo.setLicenseKey(${JSON.stringify(MUI_X_PRO_LICENSE)});
    
    const initialState = ${serializedInitialState}

    const rootNode = document.createElement('div');
    document.body.append(rootNode);
    const root = ReactDOM.createRoot(rootNode);
    root.render(<AppCanvas basename='/api/runtime/app' initialState={initialState} />)
  `;
}

export async function createBuilder(filePath: string) {
  const dom = await loadLocalDomFromFile(filePath);

  const toolpadPLugin: esbuild.Plugin = {
    name: 'toolpad',
    setup(build) {
      build.onResolve({ filter: /^toolpad:/ }, (args) => ({
        path: args.path.slice('toolpad:'.length),
        namespace: 'toolpad',
      }));

      build.onLoad({ filter: /.*/, namespace: 'toolpad' }, async (args) => {
        switch (args.path) {
          case 'main.tsx': {
            return {
              loader: 'tsx',
              contents: await createMain(dom),
              resolveDir: projectRoot,
              watchFiles: [filePath],
            };
          }
          default: {
            throw new Error(`Can't resolve "${args.path}" for toolpad namespace`);
          }
        }
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
    outfile: 'main.js',
    target: 'es2022',
    jsx: 'transform',
    jsxDev: true,
    tsconfig: './tsconfig.esbuild.json',
    external: ['quickjs-emscripten'],
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
