import { PageRow } from '@mui/toolpad-components';
import importedComponentRenderer from './importedComponentRenderer';
import { ToolpadComponentDefinition } from './componentDefinition';
import addDefaultProps from './addDefaultProps';

export default {
  id: 'PageRow',
  displayName: 'PageRow',
  render: importedComponentRenderer('@mui/toolpad-components', 'PageRow'),
  Component: addDefaultProps(PageRow, {
    spacing: 2,
    alignItems: 'start',
    justifyContent: 'start',
  }),
  argTypes: {
    spacing: {
      typeDef: { type: 'number' },
      defaultValue: 2,
    },
    alignItems: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'stretch', 'baseline'],
      },
      defaultValue: 'start',
      label: 'Vertical alignment',
      control: { type: 'VerticalAlign' },
    },
    justifyContent: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      },
      defaultValue: 'start',
      label: 'Horizontal alignment',
      control: { type: 'HorizontalAlign' },
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
  },
} as ToolpadComponentDefinition;
