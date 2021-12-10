import TextField from '@mui/material/TextField';
import { createComponent } from '@mui/studio-core';

export default createComponent(TextField, {
  props: {
    label: { type: 'string', defaultValue: '' },
    variant: {
      type: 'TextFieldVariant',
      defaultValue: 'outlined',
    },
    value: {
      type: 'string',
      defaultValue: '',
    },
  },
});
