import * as React from 'react';
import { AppHostProvider } from '@toolpad/studio-runtime';
import { DataGrid } from '@toolpad/studio-components';

const ROWS = [
  {
    id: '1',
    Name: 'John',
    Age: 25,
    Location: 'New York',
    Occupation: 'Farmer',
    Email: 'johnny@example.com',
    Company: 'ACME',
  },
  {
    id: '2',
    Name: 'Jane',
    Age: 37,
    Location: 'Paris',
    Occupation: 'Plumber',
    Email: 'jane@example.com',
    Company: 'MUI',
  },
  {
    id: '3',
    Name: 'Susan',
    Age: 19,
    Location: 'London',
    Occupation: 'Programmer',
    Email: 'susy@example.com',
    Company: 'MUI',
  },
];

const COLUMNS = [
  { field: 'Age', type: 'number' },
  { field: 'Occupation', type: 'string', width: 200 },
  { field: 'Email', type: 'string', width: 200 },
  { field: 'Company', type: 'string', width: 200 },
  { field: 'Name', type: 'string', pin: 'left', width: 150 },
  { field: 'Location', type: 'string', pin: 'right', width: 200 },
];

export default function DataGridPinning() {
  return (
    <AppHostProvider plan="pro">
      <DataGrid rows={ROWS} columns={COLUMNS} height={300} />
    </AppHostProvider>
  );
}
