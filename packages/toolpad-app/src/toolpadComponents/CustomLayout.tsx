import importedComponentRenderer from './importedComponentRenderer';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'CustomLayout',
  displayName: 'CustomLayout',
  render: importedComponentRenderer('@mui/toolpad-components', 'CustomLayout'),
  argTypes: {
    child3: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
  },
} as ToolpadComponentDefinition;
