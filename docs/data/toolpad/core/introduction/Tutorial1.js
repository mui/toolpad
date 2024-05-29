import * as React from 'react';
import { createDataProvider } from '@toolpad/core/DataProvider';
import { DataGrid } from '@toolpad/core/DataGrid';
import Box from '@mui/material/Box';

const npmData = createDataProvider({
  async getMany() {
    const res = await fetch('https://api.npmjs.org/downloads/range/last-year/react');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const { downloads } = await res.json();

    return { rows: downloads };
  },
  idField: 'day',
  fields: {
    day: { type: 'date' },
    downloads: { type: 'number' },
  },
});

export default function Tutorial1() {
  return (
    <Box sx={{ height: 300, width: '100%' }}>
      <DataGrid dataProvider={npmData} />
    </Box>
  );
}
