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

export default function Tutorial1() {
  return (
    <Box sx={{ height: 300, width: '100%' }}>
      <DataGrid dataProvider={movieData} />
    </Box>
  );
}
