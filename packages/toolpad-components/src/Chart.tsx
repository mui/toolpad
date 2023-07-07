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
  height?: number;
}

function Chart({ data = [], height, sx }: ChartProps) {
  const xValues = React.useMemo(
    () =>
      data
        .map((dataSeries) =>
          dataSeries.data.map((dataSeriesPoint) => dataSeriesPoint[dataSeries.xKey]),
        )
        .flat(),
    [data],
  );

  return (
    <Container sx={sx}>
      <ResponsiveContainer width="100%" height={height}>
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
  resizableHeightProp: 'height',
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
    height: {
      type: 'number',
      default: 400,
      minimum: 100,
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
