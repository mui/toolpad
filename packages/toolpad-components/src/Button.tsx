import { Button, ButtonProps } from '@mui/material';
import { ComponentConfig } from '@mui/toolpad-core';
import withDefaultProps from './utils/addDefaultProps';

export default withDefaultProps(Button, {
  children: 'Button Text',
  variant: 'contained',
  color: 'primary',
});

export const config: ComponentConfig<ButtonProps> = {
  argTypes: {
    children: {
      label: 'content',
      typeDef: { type: 'string' },
    },
    onClick: {
      typeDef: { type: 'function' },
    },
    disabled: {
      typeDef: { type: 'boolean' },
    },
    variant: {
      typeDef: { type: 'string', enum: ['contained', 'outlined', 'text'] },
    },
    color: {
      typeDef: { type: 'string', enum: ['primary', 'secondary'] },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
};
