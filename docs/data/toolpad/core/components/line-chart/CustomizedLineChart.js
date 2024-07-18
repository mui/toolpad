import * as React from 'react';
import { createDataProvider } from '@toolpad/core/DataProvider';
import { LineChart } from '@toolpad/core/LineChart';
import Box from '@mui/material/Box';

const myData = createDataProvider({
  async getMany() {
    return {
      rows: [
        { id: 1, value: 19 },
        { id: 2, value: 34 },
        { id: 3, value: 6 },
        { id: 4, value: 14 },
        { id: 5, value: 17 },
      ],
    };
  },
  fields: {
    id: { label: 'ID' },
    value: { label: 'Value', type: 'number' },
  },
});

export default function CustomizedLineChart() {
  return (
    <Box sx={{ width: '100%' }}>
      <LineChart
        height={250}
        dataProvider={myData}
        series={[
          {
            dataKey: 'value',
            label: 'Custom Label',
            color: 'red',
            area: true,
            showMark: false,
          },
        ]}
      />
    </Box>
  );
}
