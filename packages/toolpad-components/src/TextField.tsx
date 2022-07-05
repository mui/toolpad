import * as React from 'react';
import { Box, TextField as MuiTextField, TextFieldProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

function TextField({ ...props }: TextFieldProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <MuiTextField {...props} />
    </Box>
  );
}

export default createComponent(TextField, {
  argTypes: {
    label: {
      typeDef: { type: 'string' },
    },
    variant: {
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    disabled: {
      typeDef: { type: 'boolean' },
    },
    fullWidth: {
      typeDef: { type: 'boolean' },
    },
    size: {
      typeDef: { type: 'string', enum: ['small', 'normal'] },
      defaultValue: 'small',
    },
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      onChangeHandler: (event: React.ChangeEvent<HTMLInputElement>) => event.target.value,
      defaultValue: '',
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
