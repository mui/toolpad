import { Button } from '@mui/material';
import { createComponent } from '@mui/studio-core';

export default createComponent(Button, {
  props: {
    children: { type: 'string', defaultValue: 'Button Text' },
    disabled: { type: 'boolean', defaultValue: false },
    variant: {
      type: 'ButtonVariant',
      defaultValue: 'contained',
    },
  },
});
