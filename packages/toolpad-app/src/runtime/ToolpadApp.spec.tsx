import * as React from 'react';
import { render, waitFor as waitForOrig, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LiveBindings, RuntimeEvents } from '@mui/toolpad-core';
import ToolpadApp from './ToolpadApp';
import * as appDom from '../appDom';
import createRuntimeState from '../createRuntimeState';
import { bridge } from '../canvas/ToolpadBridge';
import { BridgeContext } from '../canvas/BridgeContext';

async function loadComponents() {
  return {};
}

// More sensible default for these tests
const waitFor: typeof waitForOrig = (waiter, options) =>
  waitForOrig(waiter, { timeout: 10000, ...options });

function renderPage(initPage: (dom: appDom.AppDom, page: appDom.PageNode) => appDom.AppDom) {
  let dom = appDom.createDom();
  const root = appDom.getNode(dom, dom.root, 'app');
  const page = appDom.createNode(dom, 'page', {
    name: 'Page',
    attributes: {
      title: appDom.createConst(''),
    },
  });
  dom = appDom.addNode(dom, page, root, 'pages');

  dom = initPage(dom, page);

  window.history.replaceState({}, 'Test page', `/toolpad/pages/${page.id}`);

  const state = createRuntimeState({ dom });

  return render(
    <BridgeContext.Provider value={bridge}>
      <ToolpadApp loadComponents={loadComponents} state={state} basename="toolpad" />
    </BridgeContext.Provider>,
  );
}

test(`Static Text`, async () => {
  renderPage((dom, page) => {
    const text = appDom.createNode(dom, 'element', {
      attributes: { component: appDom.createConst('Text') },
      props: { value: appDom.createConst('Hello World') },
    });
    dom = appDom.addNode(dom, text, page, 'children');

    return dom;
  });

  await waitFor(() => screen.getByTestId('page-root'));

  const text = screen.getByText('Hello World');
  expect(text).toHaveClass('MuiTypography-root');
});

test(`Default Text`, async () => {
  renderPage((dom, page) => {
    const text = appDom.createNode(dom, 'element', {
      attributes: { component: appDom.createConst('Text') },
      props: {},
    });
    dom = appDom.addNode(dom, text, page, 'children');

    return dom;
  });

  await waitFor(() => screen.getByTestId('page-root'));

  const text = screen.getByText('text', { selector: 'p' });
  expect(text).toHaveClass('MuiTypography-root');
});

test(`simple databinding`, async () => {
  renderPage((dom, page) => {
    const textField = appDom.createNode(dom, 'element', {
      name: 'theTextInput',
      attributes: { component: appDom.createConst('TextField') },
      props: {
        label: appDom.createConst('The Input'),
        defaultValue: appDom.createConst('Default Text'),
      },
    });
    dom = appDom.addNode(dom, textField, page, 'children');

    const text = appDom.createNode(dom, 'element', {
      attributes: { component: appDom.createConst('Text') },
      props: { value: { type: 'jsExpression', value: 'theTextInput.value' } },
    });
    dom = appDom.addNode(dom, text, page, 'children');

    return dom;
  });

  await waitFor(() => screen.getByTestId('page-root'));

  const text = screen.getByText('Default Text');
  const textField = screen.getByLabelText('The Input');

  await act(async () => {
    textField.focus();
    fireEvent.change(textField, { target: { value: 'Hello Everybody' } });
  });

  expect(text).toHaveTextContent('Hello Everybody');
});

test(`default Value for binding`, async () => {
  renderPage((dom, page) => {
    const select = appDom.createNode(dom, 'element', {
      name: 'theTextInput',
      attributes: { component: appDom.createConst('Select') },
      props: {
        label: appDom.createConst('The select'),
        options: { type: 'jsExpression', value: 'undefined' },
      },
    });
    dom = appDom.addNode(dom, select, page, 'children');
    return dom;
  });

  await waitFor(() => screen.getByTestId('page-root'));

  screen.getByLabelText('The select');
});

test(`Databinding errors`, async () => {
  const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
  let bindings: LiveBindings | undefined;

  const bindingsUpdateHandler = (event: RuntimeEvents['pageBindingsUpdated']) => {
    bindings = event.bindings;
  };
  bridge.canvasEvents.on('pageBindingsUpdated', bindingsUpdateHandler);

  try {
    let nonExisting: appDom.ElementNode;
    let selfReferencing: appDom.ElementNode;
    let cyclic1: appDom.ElementNode;
    let cyclic2: appDom.ElementNode;
    renderPage((dom, page) => {
      nonExisting = appDom.createNode(dom, 'element', {
        attributes: { component: appDom.createConst('Text') },
        props: { value: { type: 'jsExpression', value: 'nonExisting.foo' } },
      });
      dom = appDom.addNode(dom, nonExisting, page, 'children');

      selfReferencing = appDom.createNode(dom, 'element', {
        name: 'selfReferencing',
        attributes: { component: appDom.createConst('Text') },
        props: { value: { type: 'jsExpression', value: 'selfReferencing.value' } },
      });
      dom = appDom.addNode(dom, selfReferencing, page, 'children');

      cyclic1 = appDom.createNode(dom, 'element', {
        name: 'cyclic1',
        attributes: { component: appDom.createConst('Text') },
        props: { value: { type: 'jsExpression', value: 'cyclic2.value' } },
      });
      dom = appDom.addNode(dom, cyclic1, page, 'children');

      cyclic2 = appDom.createNode(dom, 'element', {
        name: 'cyclic2',
        attributes: { component: appDom.createConst('Text') },
        props: { value: { type: 'jsExpression', value: 'cyclic1.value' } },
      });
      dom = appDom.addNode(dom, cyclic2, page, 'children');

      return dom;
    });

    await waitFor(() => screen.getByTestId('page-root'));
    await waitFor(() => expect(bindings).toBeDefined());

    expect(bindings![`${nonExisting!.id}.props.value`]).toHaveProperty(
      'error',
      expect.objectContaining({
        message: 'nonExisting is not defined',
      }),
    );
    expect(bindings![`${selfReferencing!.id}.props.value`]).toHaveProperty(
      'error',
      expect.objectContaining({
        message: 'Cycle detected "selfReferencing.value"',
      }),
    );
    expect(bindings![`${cyclic1!.id}.props.value`]).toHaveProperty(
      'error',
      expect.objectContaining({
        message: 'Cycle detected "cyclic1.value"',
      }),
    );
    expect(bindings![`${cyclic2!.id}.props.value`]).toHaveProperty(
      'error',
      expect.objectContaining({
        message: 'Cycle detected "cyclic1.value"',
      }),
    );

    expect(consoleErrorMock).toHaveBeenCalled();
  } finally {
    bridge.canvasEvents.off('pageBindingsUpdated', bindingsUpdateHandler);
    consoleErrorMock.mockRestore();
  }
});
