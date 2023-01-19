import * as esbuild from 'esbuild';
import serializeJavascript from 'serialize-javascript';
import * as appDom from '../appDom';
import createRuntimeState from '../createRuntimeState';
import projectRoot from './projectRoot';

async function createMain(dom: appDom.AppDom) {
  const initialState = createRuntimeState({ appId: '', dom });
  const serializedInitialState = serializeJavascript(initialState, {
    ignoreFunction: true,
  });

  return `
    import * as React from 'react';
    import * as ReactDOM from 'react-dom/client';
    import AppCanvas from './src/canvas';
    
    const initialState = ${serializedInitialState}

    const rootNode = document.createElement('div');
    document.body.append(rootNode);
    const root = ReactDOM.createRoot(rootNode);
    root.render(<AppCanvas basename='/api/runtime/app' initialState={initialState} />)
  `;
}

export async function createBuilder(initialDom: appDom.AppDom) {
  let dom = initialDom;

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
            };
          }
          default: {
            throw new Error(`Can't resolve "${args.path}" for toolpad namespace`);
          }
        }
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
    async rebuild(newDom: appDom.AppDom) {
      dom = newDom;
      await ctx.rebuild();
    },
    getResult() {
      return result;
    },
  };
}
