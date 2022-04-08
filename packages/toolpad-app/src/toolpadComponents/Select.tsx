import { Select } from '@mui/toolpad-components';
import { ToolpadComponentDefinition } from './componentDefinition';
import { URI_SELECT_OPTIONS } from '../schemas';
import importedComponentRenderer from './importedComponentRenderer';
import wrapWithDefaultProps from './WrapWithDefaultProps';

export default {
  id: 'Select',
  displayName: 'Select',
  render: importedComponentRenderer('@mui/toolpad-components', 'Select'),
  Component: wrapWithDefaultProps(Select, {
    label: '',
    variant: 'outlined',
    size: 'small',
    value: '',
    options: [],
  }),
  argTypes: {
    label: {
      typeDef: { type: 'string' },
      defaultValue: '',
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
      defaultValue: '',
      defaultValueProp: 'defaultValue',
      onChangeHandler: {
        params: ['event'],
        valueGetter: 'event.target.value',
      },
    },
    options: {
      typeDef: { type: 'array' },
      control: { type: 'json', schema: URI_SELECT_OPTIONS },
      defaultValue: [],
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
} as ToolpadComponentDefinition;
