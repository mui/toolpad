// look into https://github.com/guybedford/es-module-shims
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { jsx } from 'react/jsx-runtime';

let currentCode = 'export default () => null';
let onCurrentCodeChange = () => {};

function postToParent(message) {
  window.parent?.postMessage(message, window.location.origin);
}

window.addEventListener(
  'message',
  (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }
    const { code } = event.data;
    currentCode = code;
    onCurrentCodeChange();
  },
  false,
);

function AppHost() {
  const [rendered, setRendered] = React.useState({ Component: () => null });

  React.useEffect(() => {
    const renderCode = () => {
      import(`data:text/javascript;charset=utf-8,${currentCode}`).then((mod) => {
        if (mod.default) {
          setRendered({ Component: mod.default });
        }
      });
    };

    onCurrentCodeChange = renderCode;
    renderCode();
  }, []);

  React.useEffect(() => {
    postToParent({
      source: 'studio-sandbox-render',
    });
  }, [rendered]);

  return jsx(rendered.Component, {});
}

const observer = new ResizeObserver((entries) => {
  const [documentEntry] = entries;
  const { width, height } = documentEntry.contentRect;
  postToParent({
    source: 'studio-sandbox-resize',
    width,
    height,
  });
});
observer.observe(window.document.documentElement);

ReactDOM.render(jsx(AppHost, {}), document.getElementById('root'));

postToParent({
  source: 'studio-sandbox-ready',
});
