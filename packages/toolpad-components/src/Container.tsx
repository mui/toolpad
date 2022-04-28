import { Container } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import withDefaultProps from './utils/addDefaultProps';

export default createComponent(withDefaultProps(Container, {}), {
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
