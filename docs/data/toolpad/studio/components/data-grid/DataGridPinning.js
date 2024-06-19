import * as React from 'react';
import { AppHostProvider } from '@toolpad/studio-runtime';
import { DataGrid } from '@toolpad/studio-components';

const ROWS = [
  {
    id: '1',
    Name: 'John',
    Location: 'New York',
  },
  {
    id: '2',
    Name: 'Jane',
    Location: 'Paris',
  },
  {
    id: '3',
    Name: 'Susan',
    Location: 'London',
  },
];

const COLUMNS = [
  { field: 'id', type: 'string' },
  { field: 'Name', type: 'string', pin: 'left' },
  { field: 'Location', type: 'string', pin: 'right' },
];

export default function DataGridPinning() {
  return (
    <AppHostProvider plan="pro">
      <DataGrid rows={ROWS} columns={COLUMNS} height={300} />
    </AppHostProvider>
  );
}
