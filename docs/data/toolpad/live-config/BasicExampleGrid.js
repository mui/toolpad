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
  },
  dependencies: [
    ['react', () => import('react')],
    ['@mui/x-data-grid-pro', () => import('@mui/x-data-grid-pro')],
    ['@mui/material', () => import('@mui/material')],
    ['@mui/toolpad-next/runtime', () => import('@mui/toolpad-next/runtime')],
  ],
};

export default function BasicExampleGrid() {
  const { Component: Grid } = useLiveComponent(DEFINITION);

  const RenderedGrid = Grid || FallBack;

  return <RenderedGrid />;
}
