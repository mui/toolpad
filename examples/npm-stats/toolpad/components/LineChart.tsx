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
  loading?: boolean;
}

function ChartExport({ loading, data }: LineChartProps) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="downloads" stroke="#87bc45" isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      {!data || loading ? (
        <div
          style={{
            position: 'absolute',
            inset: '0 0 0 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </div>
      ) : null}
    </div>
  );
}

export default createComponent(ChartExport, {
  loadingProp: 'loading',
  argTypes: {
    data: {
      type: 'array',
      defaultValue: [],
    },
  },
});
