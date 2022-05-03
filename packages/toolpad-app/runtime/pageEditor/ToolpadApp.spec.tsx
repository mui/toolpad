import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ToolpadApp from './ToolpadApp';
import * as appDom from '../../src/appDom';
import { getToolpadComponents } from '../../src/toolpadComponents';

test(`simple databinding`, async () => {
  const appId = '12345';
  const version = 'preview';

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

  const components = getToolpadComponents(appId, version, dom);

  window.history.replaceState({}, 'Test page', `/toolpad/pages/${page.id}`);

  render(
    <ToolpadApp
      appId={appId}
      version={version}
      basename="toolpad"
      dom={dom}
      components={components}
    />,
  );

  const typography = await waitFor(() => screen.getByText('Hello World'));

  expect(typography).toHaveClass('MuiTypography-root');
});
