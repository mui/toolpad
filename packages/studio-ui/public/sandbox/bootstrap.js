// look into https://github.com/guybedford/es-module-shims
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { jsx } from 'react/jsx-runtime';

let PageComponent = () => null;
let onPageChange = () => {};

function postMessageToParent(message) {
  window.parent?.postMessage(message, window.location.origin);
}

window.addEventListener(
  'message',
  (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }
    if (event.data.type === 'studio-sandbox-accept') {
      import(`data:text/javascript;charset=utf-8,${event.data.code}`).then((mod) => {
        if (mod.default) {
          PageComponent = mod.default;
          onPageChange();
        }
      });
    }
  },
  false,
);

function AppHost() {
  const [counter, setCounter] = React.useState(0);

  React.useEffect(() => {
    onPageChange = () => {
      setCounter((count) => count + 1);
    };
    return () => {
      onPageChange = () => {};
    };
  }, []);

  React.useEffect(() => {
    postMessageToParent({ type: 'studio-sandbox-render' });
  }, [counter]);

  return jsx(PageComponent, {});
}

const observer = new ResizeObserver((entries) => {
  const [documentEntry] = entries;
  const { width, height } = documentEntry.contentRect;
  postMessageToParent({
    type: 'studio-sandbox-resize',
    width,
    height,
  });
});
observer.observe(window.document.documentElement);

ReactDOM.render(jsx(AppHost, {}), document.getElementById('root'));

postMessageToParent({ type: 'studio-sandbox-ready' });
