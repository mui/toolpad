import * as React from 'react';
import { useLiveComponent } from '@mui/toolpad-next/runtime';

function FallBack() {
  return <div>Loading...</div>;
}

const DEFINITION = {
  target: 'dev',
  filePath: '/MyGrid.yml',
  file: {
    kind: 'DataGrid',
    spec: {},
  },
  dependencies: [
    ['react', () => import('react')],
    ['@mui/x-data-grid-pro', () => import('@mui/x-data-grid-pro')],
    ['@mui/material', () => import('@mui/material')],
    ['@mui/toolpad-next/runtime', () => import('@mui/toolpad-next/runtime')],
  ],
  backend: {
    getConnectionStatus: () => 'connected',
    subscribe: () => () => {},
    saveFile: () => {},
  },
};

export default function BasicExampleGrid() {
  const { Component: Grid } = useLiveComponent(DEFINITION);

  const RenderedGrid = Grid || FallBack;

  return <RenderedGrid />;
}
