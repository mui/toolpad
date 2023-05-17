// Create a recharts bar chart

import React from 'react';
import { createComponent } from '@mui/toolpad/browser';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export interface BarProps {
  data: Array<any>;
}

function Bar2({ data }: BarProps) {
  // const { data: dataProp } = props;
  // const data = dataProp;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        width={800}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip />
        <Legend verticalAlign="top" />
        <Bar name="Total sales in Mn" dataKey="y" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default createComponent(Bar2, {
  argTypes: {
    data: {
      typeDef: { type: 'array' },
      defaultValue: [
        { x: 'Apples', y: 12 },
        { x: 'Bananas', y: 2 },
      ],
    },
  },
});
