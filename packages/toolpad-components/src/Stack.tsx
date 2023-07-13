import { Stack } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import { SX_PROP_HELPER_TEXT } from './constants';

export default createComponent(Stack, {
  argTypes: {
    direction: {
      type: 'string',
      enum: ['row', 'row-reverse', 'column', 'column-reverse'],
      default: 'row',
    },
    alignItems: {
      type: 'string',
      enum: ['start', 'center', 'end', 'stretch', 'baseline'],
      default: 'start',
    },
    justifyContent: {
      type: 'string',
      enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      default: 'start',
    },
    gap: {
      type: 'number',
      default: 2,
    },
    margin: {
      type: 'number',
    },
    children: {
      type: 'element',
      control: { type: 'slots' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
