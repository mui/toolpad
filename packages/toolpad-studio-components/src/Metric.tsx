import * as React from 'react';
import { Skeleton, Typography, Paper } from '@mui/material';
import {
  NumberFormat,
  createFormat,
  NUMBER_FORMAT_SCHEMA,
  FormattedNumber,
} from '@toolpad/studio-runtime/numberFormat';
import createBuiltin from './createBuiltin';

export interface ColorScaleStop {
  value: number;
  color?: string;
}

export interface ColorScale {
  base?: string;
  stops?: ColorScaleStop[];
}

interface MetricProps {
  value: number;
  loading?: boolean;
  numberFormat?: NumberFormat;
  label?: string;
  caption?: string;
  conditionalFormat?: ColorScale;
  fullWidth?: boolean;
}

function resolveColor(colorScale: ColorScale, value: number) {
  const { base, stops = [] } = colorScale;
  let stopValue: number = -Infinity;
  let color = base;

  for (const stop of stops) {
    if (stop.value > stopValue && value > stop.value) {
      stopValue = stop.value;
      color = stop.color;
    }
  }

  return color;
}

function Metric({
  fullWidth,
  conditionalFormat,
  loading,
  value,
  numberFormat,
  label,
  caption,
}: MetricProps) {
  const format = React.useMemo(() => createFormat(numberFormat), [numberFormat]);

  const color = React.useMemo(
    () => (conditionalFormat ? resolveColor(conditionalFormat, value) : undefined),
    [conditionalFormat, value],
  );

  return (
    <Paper sx={{ p: 2, minWidth: 160, width: fullWidth ? '100%' : undefined }}>
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

export default createBuiltin(Metric, {
  helperText:
    'The Metric component can be used to display a single numerical value. it supports multiple numerical formats such as bytes, currency, percentage... It also supports conditional formatting to adapt the color based on the numerical value.',
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
      label: 'Number format',
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
    conditionalFormat: {
      helperText: 'The color of the number, dependent on the value.',
      label: 'Conditional format',
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
    fullWidth: {
      helperText: 'Whether the button should occupy all available horizontal space.',
      type: 'boolean',
    },
  },
});
