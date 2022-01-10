import Stack from '@mui/material/Stack';
import { createComponent } from '@mui/studio-core';

export default createComponent(Stack, {
  argTypes: {
    gap: {
      typeDef: { type: 'number' },
      defaultValue: 2,
    },
    direction: {
      typeDef: {
        type: 'string',
        enum: ['row', 'row-reverse', 'column', 'column-reverse'],
      },
      defaultValue: 'row',
    },
    alignItems: {
      typeDef: {
        type: 'string',
        enum: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
      },
      defaultValue: 'center',
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
  },
});
