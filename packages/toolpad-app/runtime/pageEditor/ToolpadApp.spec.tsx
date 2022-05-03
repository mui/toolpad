import React from 'react';
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ToolpadApp from './ToolpadApp';
import * as appDom from '../../src/appDom';
import { getToolpadComponents } from '../../src/toolpadComponents';

function renderPage(initPage: (dom: appDom.AppDom, page: appDom.PageNode) => appDom.AppDom) {
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

  dom = initPage(dom, page);

  const components = getToolpadComponents(appId, version, dom);

  window.history.replaceState({}, 'Test page', `/toolpad/pages/${page.id}`);

  return render(
    <ToolpadApp
      appId={appId}
      version={version}
      basename="toolpad"
      dom={dom}
      components={components}
    />,
  );
}

test(`Static Text`, async () => {
  renderPage((dom, page) => {
    const text = appDom.createNode(dom, 'element', {
      attributes: { component: appDom.createConst('Typography') },
      props: { value: appDom.createConst('Hello World') },
    });
    dom = appDom.addNode(dom, text, page, 'children');

    return dom;
  });

  const text = await waitFor(() => screen.getByText('Hello World'));
  expect(text).toHaveClass('MuiTypography-root');
});

test(`Default Text`, async () => {
  renderPage((dom, page) => {
    const text = appDom.createNode(dom, 'element', {
      attributes: { component: appDom.createConst('Typography') },
      props: {},
    });
    dom = appDom.addNode(dom, text, page, 'children');

    return dom;
  });

  const text = await waitFor(() => screen.getByText('Text'));
  expect(text).toHaveClass('MuiTypography-root');
});

test(`simple databinding`, async () => {
  renderPage((dom, page) => {
    const textField = appDom.createNode(dom, 'element', {
      name: 'theTextInput',
      attributes: { component: appDom.createConst('TextField') },
      props: {
        label: appDom.createConst('The Input'),
        value: appDom.createConst('Default Text'),
      },
    });
    dom = appDom.addNode(dom, textField, page, 'children');

    const text = appDom.createNode(dom, 'element', {
      attributes: { component: appDom.createConst('Typography') },
      props: { value: { type: 'jsExpression', value: 'theTextInput.value' } },
    });
    dom = appDom.addNode(dom, text, page, 'children');

    return dom;
  });

  const text = await waitFor(() => screen.getByText('Default Text'));

  const textField = screen.getByLabelText('The Input');

  act(() => {
    textField.focus();
    fireEvent.change(textField, { target: { value: 'Hello Everybody' } });
  });

  expect(text).toHaveTextContent('Hello Everybody');
});
