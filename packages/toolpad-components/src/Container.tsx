import { Container } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export default createComponent(Container, {
  argTypes: {
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
