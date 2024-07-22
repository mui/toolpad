import * as React from 'react';
import { createDataProvider } from '@toolpad/core/DataProvider';
import { LineChart } from '@toolpad/core/LineChart';
import Box from '@mui/material/Box';

const myData = createDataProvider({
  async getMany() {
    throw new Error('Failed to fetch data');
  },
  fields: {
    id: { label: 'ID' },
    value: { label: 'Value', type: 'number' },
  },
});

export default function ErrorLineChart() {
  return (
    <Box sx={{ width: '100%' }}>
      <LineChart height={150} dataProvider={myData} />
    </Box>
  );
}
