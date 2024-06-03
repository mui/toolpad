import * as React from 'react';
import { createDataProvider, DataContext } from '@toolpad/core/DataProvider';
import { DataGrid } from '@toolpad/core/DataGrid';
import { LineChart } from '@toolpad/core/LineChart';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Toolbar } from '@mui/material';

const npmData = createDataProvider({
  async getMany({ filter }) {
    const res = await fetch(
      `https://api.npmjs.org/downloads/range/${encodeURIComponent(filter.range?.equals ?? 'last-month')}/react`,
    );
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(`HTTP ${res.status}: ${error}`);
    }
    const { downloads } = await res.json();
    return { rows: downloads };
  },
  idField: 'day',
  fields: {
    day: { type: 'date' },
    downloads: { type: 'number', label: 'Npm Downloads' },
  },
});

export default function Tutorial3() {
  const [range, setRange] = React.useState('last-month');
  const filter = React.useMemo(() => ({ range: { equals: range } }), [range]);

  return (
    <Stack sx={{ width: '100%' }} spacing={2}>
      <DataContext filter={filter}>
        <Toolbar disableGutters>
          <TextField
            select
            label="Range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <MenuItem value="last-month">Last Month</MenuItem>
            <MenuItem value="last-year">Last Year</MenuItem>
          </TextField>
        </Toolbar>
        <DataGrid height={300} dataProvider={npmData} />
        <LineChart
          height={300}
          dataProvider={npmData}
          xAxis={[{ dataKey: 'day' }]}
          series={[{ dataKey: 'downloads' }]}
        />
      </DataContext>
    </Stack>
  );
}
