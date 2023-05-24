import * as React from 'react';
import { createComponent } from '@mui/toolpad-core';
import { Box, BoxProps } from '@mui/material';
import { SX_PROP_HELPER_TEXT } from './constants.js';

type ChartDataSeriesKind = 'line' | 'bar' | 'pie';

export interface ChartDataSeries<D = Record<string, unknown>> {
  kind: ChartDataSeriesKind;
  label: string;
  data: D;
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
      schema: '/schemas/ChartData.json',
      control: { type: 'ChartData' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
