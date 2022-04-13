import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'CustomLayout',
  displayName: 'CustomLayout',
  importedModule: '@mui/toolpad-components',
  importedName: 'CustomLayout',
  argTypes: {
    child3: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
  },
} as ToolpadComponentDefinition;
