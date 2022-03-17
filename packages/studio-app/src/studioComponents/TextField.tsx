import { StudioComponentDefinition } from './studioComponentDefinition';
import importedComponentRenderer from './importedComponentRenderer';

export default {
  id: 'TextField',
  displayName: 'TextField',
  render: importedComponentRenderer('@mui/material', 'TextField'),
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
} as StudioComponentDefinition;
