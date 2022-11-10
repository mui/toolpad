import * as React from 'react';
import {
  Skeleton,
  Typography as MuiTypography,
  TypographyProps as MuiTypographyProps,
} from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import ReactMarkdown from 'react-markdown';

interface TextProps extends Omit<MuiTypographyProps, 'children'> {
  mode: string;
  value: string;
  loading?: boolean;
}

function Text({ value, loading, mode, sx, ...rest }: TextProps) {
  switch (mode) {
    case 'markdown':
      return loading ? <Skeleton width={150} /> : <ReactMarkdown>{value}</ReactMarkdown>;
    case 'text':
    default:
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
          {loading ? <Skeleton /> : String(value)}
        </MuiTypography>
      );
  }
}

export default createComponent(Text, {
  layoutDirection: 'both',
  loadingPropSource: ['value'],
  loadingProp: 'loading',
  argTypes: {
    mode: {
      typeDef: { type: 'string', enum: ['text', 'markdown', 'link'] },
      defaultValue: 'text',
    },
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
