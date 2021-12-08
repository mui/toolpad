import * as React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { createComponent } from '@mui/studio-core';

interface StudioButtonprops extends Omit<ButtonProps, 'children>'> {
  text: string;
}

const defaultText = 'Button Text';

function ButtonComponent({ text, ...props }: StudioButtonprops) {
  return <Button {...props}>{text}</Button>;
}

export default createComponent(ButtonComponent, {
  props: {
    text: { type: 'string', defaultValue: defaultText },
    disabled: { type: 'boolean', defaultValue: false },
    variant: {
      type: 'ButtonVariant',
      defaultValue: 'contained',
    },
  },
});
