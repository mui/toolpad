import * as React from 'react';
import { TextFieldProps } from '@mui/material';
import type { StudioComponentDefinition } from '../types';

const TextField: StudioComponentDefinition<TextFieldProps> = {
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
      onChangeTransform: (event: React.ChangeEvent<HTMLInputElement>) => event.target.value,
      onChangeEventHandler: (setStateIdentifier) =>
        `(event) => ${setStateIdentifier}(event.target.value)`,
    },
  },
  module: '@mui/studio-components',
  importedName: 'TextField',
};

export default TextField;
