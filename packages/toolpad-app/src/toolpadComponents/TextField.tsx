import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'TextField',
  displayName: 'TextField',
  importedModule: '/runtime/components.js',
  importedName: 'TextField',
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
} as ToolpadComponentDefinition;
