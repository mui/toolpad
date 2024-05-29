import * as React from 'react';
import { createDataProvider } from '@toolpad/core/DataProvider';
import { DataGrid } from '@toolpad/core/DataGrid';
import { LineChart } from '@toolpad/core/LineChart';
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

export default function Tutorial2() {
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid height={300} dataProvider={npmData} />
      <LineChart
        height={300}
        dataProvider={npmData}
        xAxis={[{ dataKey: 'day' }]}
        series={[{ dataKey: 'downloads' }]}
      />
    </Box>
  );
}
