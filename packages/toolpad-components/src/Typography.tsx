import * as React from 'react';
import { Typography as MuiTypography, TypographyProps as MuiTypographyProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

interface TypographyProps extends Omit<MuiTypographyProps, 'children'> {
  value: string;
}

function Typography({ value, ...props }: TypographyProps) {
  return <MuiTypography {...props}>{value}</MuiTypography>;
}

Typography.defaultProps = {
  value: 'Text',
} as TypographyProps;

export default createComponent(Typography, {
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
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
