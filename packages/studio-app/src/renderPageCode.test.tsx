/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import * as esbuild from 'esbuild';
import { render } from '@testing-library/react';
import renderPageCode from './renderPageCode';
import * as studioDom from './studioDom';

const STUDIO_NS = 'studio';

async function bundle(files: Record<string, string>, entry: string): Promise<string> {
  const result = await esbuild.build({
    entryPoints: [entry],
    jsx: 'transform',
    write: false,
    format: 'iife',
    bundle: true,
    globalName: 'exports',
    external: ['react', 'react-dom'],
    plugins: [
      {
        name: 'resolver',
        setup(build) {
          build.onResolve({ filter: /.*/ }, async (args) => {
            if (args.kind === 'entry-point') {
              return { namespace: STUDIO_NS, path: args.path };
            }
            if (args.namespace === STUDIO_NS) {
              if (args.path.startsWith('.') || args.path.startsWith('/')) {
                return { namespace: STUDIO_NS, path: args.path };
              }
            }
            return {};
          });

          build.onLoad({ filter: /.*/, namespace: STUDIO_NS }, (args) => {
            return { contents: files[args.path], loader: 'tsx', resolveDir: process.cwd() };
          });
        },
      },
    ],
  });
  return result.outputFiles[0].text;
}

describe('renderPageCode', () => {
  test('Basic studio dom rendering Typography component', async () => {
    let dom = studioDom.createDom();
    const root = studioDom.getNode(dom, dom.root, 'app');
    const page = studioDom.createNode(dom, 'page', { title: '', urlQuery: {}, name: 'Page' });
    dom = studioDom.addNode(dom, page, root, 'pages');
    const text = studioDom.createNode(dom, 'element', {
      component: 'Typography',
      props: { children: { type: 'const', value: 'Hello World' } },
    });
    dom = studioDom.addNode(dom, text, page, 'children');

    const { code } = renderPageCode(dom, page.id);

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
