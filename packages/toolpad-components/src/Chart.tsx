import * as React from 'react';
import { createComponent } from '@mui/toolpad-core';
import { Box, BoxProps } from '@mui/material';
import { SX_PROP_HELPER_TEXT } from './constants.js';

export const CHART_DATA_SERIES_KINDS = ['line', 'bar', 'pie'];

export interface ChartDataSeries<D = Record<string, unknown>> {
  kind: (typeof CHART_DATA_SERIES_KINDS)[number];
  label: string;
  data: D[];
  xKey: keyof D;
  yKey: keyof D;
}

export type ChartData = ChartDataSeries[];

interface ChartProps extends BoxProps {
  data?: ChartData;
}

function Chart({ data = [], ...rest }: ChartProps) {
  return <Box {...rest}>ello</Box>;
}

export default createComponent(Chart, {
  layoutDirection: 'both',
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
