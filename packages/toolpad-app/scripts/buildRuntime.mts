import * as esbuild from 'esbuild';
import * as path from 'path';
import * as appDom from '../src/appDom';
import createRuntimeState from '../src/createRuntimeState';
import { loadLocalDom } from '../src/server/localMode';

async function generate(dom: appDom.AppDom): Promise<string> {
  return `
    import * as React from 'react';
    import AppCanvas from './src/canvas';

    const rootNode = document.createElement('div');
    document.body.append(rootNode);
    const root = React.createRoot(rootNode);

    const initialState = ${JSON.stringify(createRuntimeState({ dom }))}

    root.render(<AppCanvas initialState={initialState} />)
  `;
}

const toolpadPLugin: esbuild.Plugin = {
  name: 'example',
  setup(build) {
    build.onResolve({ filter: /^toolpad:/ }, (args) => ({
      path: args.path.slice('toolpad:'.length),
      namespace: 'toolpad',
    }));

    build.onLoad({ filter: /.*/, namespace: 'toolpad' }, async (args) => {
      const localDom = await loadLocalDom();
      /*       return {
        contents: generate()
      } */
      return { contents: `console.log('Hello world')` };
    });
  },
};

const result = await esbuild.build({
  entryPoints: ['toolpad:main'],
  plugins: [toolpadPLugin],
  write: false,
  outdir: './public/runtime',
});

console.log(result);
