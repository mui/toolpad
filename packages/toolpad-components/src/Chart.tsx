import * as React from 'react';
import { createComponent } from '@mui/toolpad-core';
import { BoxProps, Container } from '@mui/material';
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { uniq } from 'lodash-es';
import { SX_PROP_HELPER_TEXT } from './constants.js';

export const CHART_DATA_SERIES_KINDS = ['line', 'bar', 'pie'];

export interface ChartDataSeries<D = Record<string, string | number>> {
  kind: (typeof CHART_DATA_SERIES_KINDS)[number];
  label: string;
  data: D[];
  xKey: keyof D;
  yKey: keyof D;
  color?: string;
}

export type ChartData = ChartDataSeries[];

interface ChartProps extends BoxProps {
  data?: ChartData;
}

function Chart({ data = [], sx }: ChartProps) {
  const xValues = React.useMemo(
    () =>
      uniq(
        data
          .map((dataSeries) =>
            dataSeries.data.map((dataSeriesPoint) => dataSeriesPoint[dataSeries.xKey]),
          )
          .flat()
          .sort(),
      ),
    [data],
  );

  return (
    <Container sx={sx}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart>
          <CartesianGrid />
          <XAxis
            dataKey="x"
            type={xValues.find((xValue) => typeof xValue !== 'number') ? 'category' : 'number'}
            allowDuplicatedCategory={false}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {data.map((dataSeries, index) => (
            <Line
              key={index}
              type="monotone"
              data={dataSeries.data.map((dataSeriesPoint) => ({
                x: dataSeriesPoint[dataSeries.xKey],
                [dataSeries.yKey]: dataSeriesPoint[dataSeries.yKey],
              }))}
              dataKey={dataSeries.yKey}
              name={dataSeries.label}
              stroke={dataSeries.color}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Container>
  );
}

export default createComponent(Chart, {
  argTypes: {
    data: {
      helperText: 'The data to be displayed.',
      type: 'array',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            kind: {
              type: 'string',
              enum: CHART_DATA_SERIES_KINDS,
            },
            label: {
              type: 'string',
            },
            data: {
              type: 'object',
              default: [],
            },
            xKey: {
              type: 'string',
            },
            yKey: {
              type: 'string',
            },
          },
        },
      },
      control: { type: 'ChartData' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
