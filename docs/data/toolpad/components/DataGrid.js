import * as React from 'react';
import { DataGrid } from '@mui/toolpad-components';

const TOOLPAD_PROPS1 = {
  rows: [
    {
      id: '1',
      Name: 'John',
    },
    {
      id: '2',
      Name: 'Jane',
    },
  ],
  columns: [
    { field: 'id', type: 'string' },
    { field: 'Name', type: 'string' },
  ],
  height: 400,
  density: 'compact',
};

export default function BasicDataGrid() {
  return <DataGrid {...TOOLPAD_PROPS1} />;
}
