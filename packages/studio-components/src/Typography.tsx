import { createComponent } from '@mui/studio-core';
import Typography from '@mui/material/Typography';

export default createComponent(Typography, {
  props: {
    children: {
      type: 'string',
      defaultValue: 'Text',
    },
  },
  argTypes: {
    children: {
      typeDef: { type: 'string' },
      defaultValue: 'Text',
    },
  },
});
