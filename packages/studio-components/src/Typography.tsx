import { createComponent } from '@mui/studio-core';
import Typography from '@mui/material/Typography';

export default createComponent(Typography, {
  argTypes: {
    children: {
      typeDef: { type: 'string' },
      defaultValue: 'Text',
    },
  },
});
