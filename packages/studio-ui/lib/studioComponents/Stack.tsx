import { StackProps } from '@mui/material';
import React from 'react';
import type { StudioComponentDefinition } from '../types';

interface StackComponentProps extends StackProps {
  // TODO: support more values for gap and direction
  gap?: number;
  direction?: 'row' | 'column';
  children?: React.ReactNode;
}

const Stack: StudioComponentDefinition<StackComponentProps> = {
  props: {
    gap: { type: 'number', defaultValue: 2 },
    direction: {
      type: 'Direction',
      defaultValue: 'row',
    },
    alignItems: {
      type: 'StackAlignment',
      defaultValue: 'center',
    },
  },
  render(context, node, resolvedProps) {
    context.addImport('@mui/material', 'Stack', 'Stack');
    return `
      <Stack 
        ${node.children.length > 0 ? context.renderSlots('slots', resolvedProps.direction) : ''} 
        ${context.renderProps(resolvedProps)}
      >
        ${
          node.children.length > 0
            ? node.children.map((childId) => context.renderNode(childId)).join('\n')
            : context.renderPlaceholder('slot')
        }
      </Stack>
    `;
  },
};

export default Stack;
