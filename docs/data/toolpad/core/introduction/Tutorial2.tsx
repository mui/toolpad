import * as React from 'react';
import { createDataProvider } from '@toolpad/core/DataProvider';
import { DataGrid } from '@toolpad/core/DataGrid';
import Box from '@mui/material/Box';

const movieData = createDataProvider({
  async getMany() {
    const res = await fetch(
      'https://raw.githubusercontent.com/mui/mui-toolpad/master/public/movies.json',
    );
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const { movies } = await res.json();
    return { rows: movies };
  },
  fields: {
    id: {},
    title: {},
    year: {},
    runtime: {},
    director: {},
  },
});

export default function Tutorial2() {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ height: 300 }}>
        <DataGrid dataProvider={movieData} />
      </Box>
      <div style={{ height: 300 }}>Barchart</div>
    </Box>
  );
}
