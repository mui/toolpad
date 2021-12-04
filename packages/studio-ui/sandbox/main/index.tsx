import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Channel } from './channel.js';

let PageComponent = () => null;
let onPageChange = () => {};

export type SandboxCommand =
  | {
      type: 'studio-sandbox-accept';
      code: string;
    }
  | {
      type: 'studio-sandbox-refresh';
      updates: string[];
    };

export type SandboxEvent =
  | {
      type: 'studio-sandbox-resized';
      width: number;
      height: number;
    }
  | {
      type: 'studio-sandbox-rendered';
    }
  | {
      type: 'studio-sandbox-ready';
    };

const channel = new Channel<SandboxCommand, SandboxEvent>(window.parent);

channel.addListener((cmd) => {
  switch (cmd.type) {
    case 'studio-sandbox-accept': {
      import(`data:text/javascript;charset=utf-8,${cmd.code}`).then(
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
    case 'studio-sandbox-refresh': {
      console.log(cmd.updates);
      break;
    }
    default:
      break;
  }
});

channel.sendMessage({ type: 'studio-sandbox-ready' });

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
    channel.sendMessage({ type: 'studio-sandbox-rendered' });
  }, [counter]);

  return <PageComponent />;
}

const observer = new ResizeObserver((entries) => {
  const [documentEntry] = entries;
  const { width, height } = documentEntry.contentRect;
  window.parent.postMessage(
    {
      type: 'studio-sandbox-resized',
      width,
      height,
    },
    window.location.origin,
  );
});

observer.observe(window.document.documentElement);

ReactDOM.render(<AppHost />, document.getElementById('root'));
