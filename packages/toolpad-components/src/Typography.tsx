import { Typography, TypographyProps } from '@mui/material';
import { ComponentConfig } from '@mui/toolpad-core';
import withDefaultProps from './utils/addDefaultProps';

export default withDefaultProps(Typography, {
  children: 'Text',
});

export const config: ComponentConfig<TypographyProps> = {
  argTypes: {
    children: {
      typeDef: { type: 'string' },
      label: 'value',
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
};
