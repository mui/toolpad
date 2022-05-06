import { TextField } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import withDefaultProps from './utils/addDefaultProps';

export default createComponent(
  withDefaultProps(TextField, {
    variant: 'outlined',
    size: 'small',
    value: '',
  }),
  {
    argTypes: {
      label: {
        typeDef: { type: 'string' },
      },
      variant: {
        typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      },
      size: {
        typeDef: { type: 'string', enum: ['small', 'normal'] },
      },
      value: {
        typeDef: { type: 'string' },
        onChangeProp: 'onChange',
        onChangeHandler: {
          params: ['event'],
          valueGetter: 'event.target.value',
        },
      },
      sx: {
        typeDef: { type: 'object' },
      },
    },
  },
);
