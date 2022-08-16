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

function Typography({ value, loading, sx, ...rest }: TypographyProps) {
  return (
    <MuiTypography
      sx={{
        minWidth: loading || !value ? 150 : undefined,
        // This will give it height, even when empty.
        // REMARK: Does it make sense to put it in core?
        [`&:empty::before`]: { content: '""', display: 'inline-block' },
        ...sx,
      }}
      {...rest}
    >
      {loading ? <Skeleton /> : value}
    </MuiTypography>
  );
}

export default createComponent(Typography, {
  hasBoxAlign: true,
  hasBoxJustify: true,
  loadingPropSource: ['value'],
  loadingProp: 'loading',
  argTypes: {
    value: {
      typeDef: { type: 'string' },
      defaultValue: 'Text',
    },
    variant: {
      typeDef: {
        type: 'string',
        enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2'],
      },
    },
    loading: {
      typeDef: { type: 'boolean' },
      defaultValue: false,
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
