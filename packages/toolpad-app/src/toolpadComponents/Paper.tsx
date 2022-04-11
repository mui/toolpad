import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Paper',
  displayName: 'Paper',
  importedModule: '@mui/toolpad-components',
  importedName: 'Paper',
  argTypes: {
    elevation: {
      typeDef: { type: 'number', minimum: 0 },
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
} as ToolpadComponentDefinition;
