import * as React from 'react';
import { createDataProvider } from '@toolpad/core/DataProvider';
import { DataGrid } from '@toolpad/core/DataGrid';
import Stack from '@mui/material/Stack';

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
    downloads: { type: 'number' },
  },
});

export default function Tutorial1() {
  return (
    <Stack sx={{ width: '100%' }} spacing={2}>
      <DataGrid height={300} dataProvider={npmData} />
    </Stack>
  );
}
