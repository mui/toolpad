import { PageRow } from '@mui/toolpad-components';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'PageRow',
  displayName: 'PageRow',
  Component: PageRow,
  importedModule: '@mui/toolpad-components',
  importedName: 'PageRow',
  argTypes: {
    spacing: {
      typeDef: { type: 'number' },
    },
    alignItems: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'stretch', 'baseline'],
      },
      label: 'Vertical alignment',
      control: { type: 'VerticalAlign' },
    },
    justifyContent: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      },
      label: 'Horizontal alignment',
      control: { type: 'HorizontalAlign' },
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
  },
} as ToolpadComponentDefinition;
