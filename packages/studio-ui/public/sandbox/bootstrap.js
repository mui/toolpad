// look into https://github.com/guybedford/es-module-shims
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { jsx } from 'react/jsx-runtime';

let currentCode = 'export default () => null';
let onCurrentCodeChange = () => {};

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

  return jsx(rendered.Component, {});
}

ReactDOM.render(jsx(AppHost, {}), document.getElementById('root'));

window.parent?.postMessage(
  {
    source: 'studio-sandbox-ready',
  },
  window.location.origin,
);
