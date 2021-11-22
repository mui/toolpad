import * as React from 'react';
import { Button as ButtonComponent, ButtonProps } from '@mui/material';
import { StudioComponentDefinition } from '../types';

const Button: StudioComponentDefinition<ButtonProps> = {
  Component: React.memo(ButtonComponent),
  props: {
    children: { type: 'string', defaultValue: 'Button Text' },
    disabled: { type: 'boolean', defaultValue: false },
    variant: {
      type: 'ButtonVariant',
      defaultValue: 'contained',
    },
  },
};

export default Button;
