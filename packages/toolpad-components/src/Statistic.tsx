import * as React from 'react';
import { Skeleton, Typography, Paper } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import {
  NumberFormat,
  createFormat,
  NUMBER_FORMAT_SCHEMA,
  FormattedNumber,
} from '@mui/toolpad-core/numberFormat';

interface StatisticProps {
  value: number;
  loading?: boolean;
  numberFormat?: NumberFormat;
  label?: string;
  caption?: string;
}

function Statistic({ loading, value, numberFormat, label, caption }: StatisticProps) {
  const format = React.useMemo(() => createFormat(numberFormat), [numberFormat]);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom noWrap>
        {label}
      </Typography>
      <Typography variant="h5" component="div" noWrap>
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
  },
});
