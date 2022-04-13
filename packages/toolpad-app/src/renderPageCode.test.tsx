/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import * as esbuild from 'esbuild';
import { render } from '@testing-library/react';
import path from 'path';
import renderPageCode from './renderPageCode';
import * as appDom from './appDom';

const TOOLPAD_NS = 'toolpad';

// Bundles a Toolpad page into a single JS file
async function bundle(files: Record<string, string>, entry: string): Promise<string> {
  const result = await esbuild.build({
    entryPoints: [entry],
    jsx: 'transform',
    write: false,
    format: 'iife',
    bundle: true,
    globalName: 'exports',
    external: ['react', 'react-dom'],
    target: 'es6',
    plugins: [
      {
        name: 'resolver',
        setup(build) {
          build.onResolve({ filter: /.*/ }, async (args) => {
            if (args.path === '@mui/toolpad-components') {
              return { path: path.resolve(__dirname, '../runtime/components/index.tsx') };
            }
            if (args.kind === 'entry-point') {
              return { namespace: TOOLPAD_NS, path: args.path };
            }
            if (args.namespace === TOOLPAD_NS) {
              if (args.path.startsWith('.') || args.path.startsWith('/')) {
                return { namespace: TOOLPAD_NS, path: args.path };
              }
            }
            return {};
          });

          build.onLoad({ filter: /.*/, namespace: TOOLPAD_NS }, (args) => {
            return { contents: files[args.path], loader: 'tsx', resolveDir: process.cwd() };
          });
        },
      },
    ],
  });
  return result.outputFiles[0].text;
}

describe('renderPageCode', () => {
  test('Basic Toolpad dom rendering Typography component', async () => {
    let dom = appDom.createDom();
    const root = appDom.getNode(dom, dom.root, 'app');
    const page = appDom.createNode(dom, 'page', {
      name: 'Page',
      attributes: {
        title: appDom.createConst(''),
        urlQuery: appDom.createConst({}),
      },
    });
    dom = appDom.addNode(dom, page, root, 'pages');
    const text = appDom.createNode(dom, 'element', {
      attributes: { component: appDom.createConst('Typography') },
      props: { children: { type: 'const', value: 'Hello World' } },
    });
    dom = appDom.addNode(dom, text, page, 'children');

    const { code } = renderPageCode('app-123', dom, page.id);

    const result = await bundle(
      {
        '/my-page.tsx': code,
      },
      '/my-page.tsx',
    );
    // eslint-disable-next-line no-eval
    const { default: Page } = eval(`() => {
      ${result};
      return exports;
    }`)();

    const { getByText } = render(<Page />);
    const typography = getByText('Hello World');
    expect(typography).toHaveClass('MuiTypography-root');
  });
});
