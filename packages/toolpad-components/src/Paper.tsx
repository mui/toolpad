import { Paper } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import withDefaultProps from './utils/addDefaultProps';

export default createComponent(withDefaultProps(Paper, { elevation: 1 }), {
  argTypes: {
    elevation: {
      typeDef: { type: 'number', minimum: 0 },
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
