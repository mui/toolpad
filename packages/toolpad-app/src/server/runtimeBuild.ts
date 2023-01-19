import * as esbuild from 'esbuild';
import * as appDom from '../appDom';
import createRuntimeState from '../createRuntimeState';
import projectRoot from './projectRoot';

const MAIN_TSX = `
  import * as React from 'react';
  import * as ReactDOM from 'react-dom/client';
  import AppCanvas from './src/canvas';
  import initialState from 'toolpad:dom.json' assert { type: "json" };

  const rootNode = document.createElement('div');
  document.body.append(rootNode);
  const root = ReactDOM.createRoot(rootNode);
  root.render(<AppCanvas initialState={initialState} />)
`;

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
              contents: MAIN_TSX,
              resolveDir: projectRoot,
            };
          }
          case 'dom.json': {
            return {
              loader: 'json',
              contents: JSON.stringify(createRuntimeState({ appId: '', dom })),
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

  return {
    rebuild() {
      return ctx.rebuild();
    },
    updateDom(newDom: appDom.AppDom) {
      dom = newDom;
    },
  };
}
