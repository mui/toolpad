import * as React from 'react';
import {
  Skeleton,
  Typography as MuiTypography,
  TypographyProps as MuiTypographyProps,
} from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

interface TypographyProps extends Omit<MuiTypographyProps, 'children'> {
  value: string;
  loading?: boolean;
}

function Typography({ value, loading, sx, ...props }: TypographyProps) {
  return (
    <MuiTypography sx={{ minWidth: loading ? 150 : undefined, ...sx }} {...props}>
      {loading ? <Skeleton /> : value}
    </MuiTypography>
  );
}

Typography.defaultProps = {
  value: 'Text',
  loading: false,
} as TypographyProps;

export default createComponent(Typography, {
  loadingPropSource: ['value'],
  loadingProp: 'loading',
  argTypes: {
    value: {
      typeDef: { type: 'string' },
    },
    variant: {
      typeDef: {
        type: 'string',
        enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2'],
      },
    },
    loading: {
      typeDef: { type: 'boolean' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
