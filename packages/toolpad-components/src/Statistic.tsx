import * as React from 'react';
import { Skeleton, Typography, Paper } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import {
  NumberFormat,
  createFormat,
  NUMBER_FORMAT_SCHEMA,
  FormattedNumber,
} from '@mui/toolpad-core/numberFormat';

export interface ColorScaleStop {
  value: number;
  color: string;
}

export interface ColorScale {
  base: string;
  stops: ColorScaleStop[];
}

interface StatisticProps {
  value: number;
  loading?: boolean;
  numberFormat?: NumberFormat;
  label?: string;
  caption?: string;
  colorScale?: ColorScale;
}

function resolveColor(colorScale: ColorScale, value: number) {
  const { base, stops } = colorScale;
  let stopValue: number = -Infinity;
  let color = base;
  for (const stop of stops) {
    if (stop.value > stopValue && value > stop.value) {
      stopValue = stop.value;
      color = stop.color;
      break;
    }
  }
  return color;
}

function Statistic({ colorScale, loading, value, numberFormat, label, caption }: StatisticProps) {
  const format = React.useMemo(() => createFormat(numberFormat), [numberFormat]);

  const color = React.useMemo(
    () => (colorScale ? resolveColor(colorScale, value) : undefined),
    [colorScale, value],
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom noWrap>
        {label}
      </Typography>
      <Typography variant="h5" component="div" color={color} noWrap>
        {loading ? (
          <Skeleton variant="text" />
        ) : (
          <FormattedNumber format={format}>{value}</FormattedNumber>
        )}
      </Typography>
      <Typography variant="body2" noWrap>
        {caption}
      </Typography>
    </Paper>
  );
}

export default createComponent(Statistic, {
  helperText: 'The Statistic component lets you display values.',
  loadingPropSource: ['value'],
  loadingProp: 'loading',
  argTypes: {
    label: {
      helperText: 'The label to be displayed.',
      type: 'string',
      default: 'label',
    },
    value: {
      helperText: 'The value to be displayed.',
      type: 'number',
      default: 0,
    },
    numberFormat: {
      helperText: 'The number format for the value.',
      type: 'object',
      schema: NUMBER_FORMAT_SCHEMA,
      control: {
        type: 'NumberFormat',
      },
    },
    caption: {
      helperText: 'The caption to be displayed.',
      type: 'string',
      default: '',
    },
    colorScale: {
      helperText: 'The color of the number, dependent on the value.',
      type: 'object',
      schema: {
        type: 'object',
        properties: {
          base: {
            type: 'string',
          },
          stops: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                value: {
                  type: 'number',
                },
                color: {
                  type: 'string',
                },
              },
              required: ['value', 'color'],
            },
          },
        },
        required: ['base', 'stops'],
      },
      control: {
        type: 'ColorScale',
      },
    },
  },
});
