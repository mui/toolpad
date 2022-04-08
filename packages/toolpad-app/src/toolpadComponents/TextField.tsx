import { TextField } from '@mui/material';
import { ToolpadComponentDefinition } from './componentDefinition';
import importedComponentRenderer from './importedComponentRenderer';
import wrapWithDefaultProps from './WrapWithDefaultProps';

export default {
  id: 'TextField',
  displayName: 'TextField',
  render: importedComponentRenderer('@mui/material', 'TextField'),
  Component: wrapWithDefaultProps(TextField, { variant: 'outlined', size: 'small', value: '' }),
  argTypes: {
    label: {
      typeDef: { type: 'string' },
    },
    variant: {
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    size: {
      typeDef: { type: 'string', enum: ['small', 'normal'] },
      defaultValue: 'small',
    },
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      onChangeHandler: {
        params: ['event'],
        valueGetter: 'event.target.value',
      },
      defaultValue: '',
      defaultValueProp: 'defaultValue',
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
} as ToolpadComponentDefinition;
