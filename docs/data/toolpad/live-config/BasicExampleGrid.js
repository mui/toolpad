import * as React from 'react';
import { useLiveComponent, Backend } from '@mui/toolpad-next/runtime';
import invariant from 'invariant';

const PORT_WINDOW_PROPERTY = '__TOOLPAD_PORT__';

function FallBack() {
  return <div>Loading...</div>;
}

let messageChannel;

if (typeof window !== 'undefined') {
  messageChannel = new MessageChannel();
  window[PORT_WINDOW_PROPERTY] = messageChannel.port1;
  messageChannel.port1.start();
  messageChannel.port2.start();
}

export default function BasicExampleGrid() {
  const [file, setFile] = React.useState(() => ({
    kind: 'DataGrid',
    spec: {
      rows: {
        kind: 'fetch',
        method: 'GET',
        url: 'https://datausa.io/api/data?drilldowns=Nation&measures=Population',
        selector: '/data',
      },
      columns: [
        {
          field: 'Nation',
          type: 'string',
        },
        {
          field: 'Year',
          type: 'string',
        },
        {
          field: 'Population',
          type: 'number',
        },
      ],
      rowIdSelector: '/ID Year',
      height: 400,
      heightMode: 'fixed',
    },
  }));

  const config = React.useMemo(
    () => ({
      target: 'dev',
      filePath: '/MyGrid.yml',
      file,
      dependencies: [
        ['react', () => import('react')],
        ['@mui/x-data-grid-pro', () => import('@mui/x-data-grid-pro')],
        ['@mui/material', () => import('@mui/material')],
        ['@mui/toolpad-next/runtime', () => import('@mui/toolpad-next/runtime')],
      ],
      backend: {
        kind: 'browser',
        port: PORT_WINDOW_PROPERTY,
      },
    }),
    [file],
  );

  const backendRef = React.useRef();

  React.useEffect(() => {
    if (backendRef.current) {
      return;
    }

    invariant(messageChannel, 'messageChannel should be initialized');

    backendRef.current = new Backend(messageChannel.port2, {
      async saveFile(filePath, fileContent) {
        setFile(fileContent);
      },
    });
  }, []);

  const { Component: Grid } = useLiveComponent(config);

  const RenderedGrid = Grid || FallBack;

  return <RenderedGrid />;
}
