import { TextField, TextFieldProps } from '@mui/material';
import { ComponentConfig } from '@mui/toolpad-core';
import withDefaultProps from './utils/addDefaultProps';

export default withDefaultProps(TextField, {
  variant: 'outlined',
  size: 'small',
  value: '',
});

export const config: ComponentConfig<TextFieldProps> = {
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
      defaultValueProp: 'defaultValue',
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
};
