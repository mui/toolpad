import { Paper } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export default createComponent(Paper, {
  argTypes: {
    elevation: {
      typeDef: { type: 'number', minimum: 0 },
      defaultValue: 1,
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
