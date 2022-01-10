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
      onChangeProp: 'onChange',
      onChangeHandler: {
        params: ['event'],
        valueGetter: 'event.target.value',
      },
    },
  },
  argTypes: {
    label: {
      typeDef: { type: 'string' },
    },
    variant: {
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      onChangeHandler: {
        params: ['event'],
        valueGetter: 'event.target.value',
      },
    },
  },
});
