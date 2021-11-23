import * as React from 'react';
import { Button as ButtonComponent, ButtonProps } from '@mui/material';
import type { StudioComponentDefinition } from '../types';

interface StudioButtonprops extends Omit<ButtonProps, 'children>'> {
  text: string;
}

function StudioButtonComponent({ text, ...props }: StudioButtonprops) {
  return <ButtonComponent {...props}>{text}</ButtonComponent>;
}

const Button: StudioComponentDefinition<StudioButtonprops> = {
  Component: React.memo(StudioButtonComponent),
  props: {
    text: { type: 'string', defaultValue: 'Button Text' },
    disabled: { type: 'boolean', defaultValue: false },
    variant: {
      type: 'ButtonVariant',
      defaultValue: 'contained',
    },
  },
};

export default Button;
