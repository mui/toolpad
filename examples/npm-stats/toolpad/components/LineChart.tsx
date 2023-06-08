import * as React from 'react';
import { createComponent } from '@mui/toolpad/browser';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import CircularProgress from '@mui/material/CircularProgress';

export interface LineChartProps {
  data: object[];
}

function ChartExport({ data }: LineChartProps) {
  if (!data || data.length === 0) {
    return <CircularProgress />;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="downloads" stroke="#87bc45" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default createComponent(ChartExport, {
  argTypes: {
    data: {
      type: 'array',
      defaultValue: [],
    },
  },
});
