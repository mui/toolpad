import { StudioComponentDefinition } from './studioComponentDefinition';
import { URI_SELECT_OPTIONS } from '../schemas';
import importedComponentRenderer from './importedComponentRenderer';

export default {
  id: 'Select',
  displayName: 'Select',
  render: importedComponentRenderer('@mui/studio-components', 'Select'),
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
} as StudioComponentDefinition;
