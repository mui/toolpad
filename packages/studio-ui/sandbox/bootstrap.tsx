// TODO: build this file from javascript (esbuild?)
// look into https://github.com/guybedford/es-module-shims
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export type OutboundMessage = {};
export type IncomingMessage = {
  type: 'studio-sandbox-accept';
  code: string;
};

let PageComponent = () => null;
let onPageChange = () => {};

function postMessageToParent(message: OutboundMessage) {
  window.parent?.postMessage(message, window.location.origin);
}

window.addEventListener(
  'message',
  (event: MessageEvent<IncomingMessage>) => {
    if (
      event.origin !== window.location.origin ||
      typeof event.data !== 'object' ||
      !event.data ||
      typeof event.data.type !== 'string'
    ) {
      return;
    }
    switch (event.data.type) {
      case 'studio-sandbox-accept': {
        import(`data:text/javascript;charset=utf-8,${event.data.code}`).then(
          (mod) => {
            if (mod.default) {
              PageComponent = mod.default;
              onPageChange();
            }
          },
          (err) => {
            // TODO should we reload here? will that kick off a reload loop?
            console.log(`Error updating module`, err);
          },
        );
        break;
      }
      default:
        break;
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

  return <PageComponent />;
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

ReactDOM.render(<AppHost />, document.getElementById('root'));

postMessageToParent({ type: 'studio-sandbox-ready' });
