import Stack from '@mui/material/Stack';
import { createComponent } from '@mui/studio-core';

export default createComponent(Stack, {
  props: {
    gap: { type: 'number', defaultValue: 2 },
    direction: {
      type: 'Direction',
      defaultValue: 'row',
    },
    alignItems: {
      type: 'StackAlignment',
      defaultValue: 'center',
    },
    children: {
      type: 'slots',
      defaultValue: null,
    },
  },
});
