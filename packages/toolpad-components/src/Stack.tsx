import { Stack } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import { SX_PROP } from './constants';

export default createComponent(Stack, {
  argTypes: {
    direction: {
      typeDef: {
        type: 'string',
        enum: ['row', 'row-reverse', 'column', 'column-reverse'],
        default: 'row',
      },
    },
    alignItems: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'stretch', 'baseline'],
        default: 'start',
      },
    },
    justifyContent: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
        default: 'start',
      },
    },
    gap: {
      typeDef: { type: 'number', default: 2 },
    },
    margin: {
      typeDef: { type: 'number' },
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
    sx: SX_PROP,
  },
});
