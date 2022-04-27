import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Select',
  displayName: 'Select',
  importedModule: '@mui/toolpad-components',
  importedName: 'Select',
  argTypes: {
    label: {
      typeDef: { type: 'string' },
    },
    disabled: {
      typeDef: { type: 'boolean' },
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
      defaultValueProp: 'defaultValue',
      onChangeHandler: {
        params: ['event'],
        valueGetter: 'event.target.value',
      },
    },
    options: {
      typeDef: { type: 'array', schema: '/schemas/SelectOptions.json' as string },
      control: { type: 'json' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
} as ToolpadComponentDefinition;
