import Paper from '@mui/material/Paper';
import { createComponent } from '@mui/studio-core';

export default createComponent(Paper, {
  props: {
    elevation: {
      type: 'number',
      defaultValue: 1,
    },
    children: {
      type: 'slot',
      defaultValue: null,
    },
  },
});
