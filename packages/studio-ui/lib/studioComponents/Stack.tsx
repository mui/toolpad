import { Stack as InnerStackComponent, StackProps } from '@mui/material';
import React from 'react';
import type { StudioComponentDefinition } from '../types';
import { Slots } from '../components/PageViewLegacy/Slot';
import { update } from '../utils/immutability';

interface StackComponentProps extends StackProps {
  // TODO: support more values for gap and direction
  gap?: number;
  direction?: 'row' | 'column';
  children?: React.ReactNode;
}

function StackComponent({ children, ...props }: StackComponentProps) {
  return (
    <InnerStackComponent {...props}>
      <Slots name="slots" direction={props.direction || 'row'}>
        {children}
      </Slots>
    </InnerStackComponent>
  );
}

const Stack: StudioComponentDefinition<StackComponentProps> = {
  Component: React.memo(StackComponent),
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
  reducer: (node, action) => {
    switch (action.type) {
      case 'FILL_SLOT': {
        const oldValue = node.children;

        return update(node, {
          children: [
            ...oldValue.slice(0, action.index),
            action.nodeId,
            ...oldValue.slice(action.index),
          ],
        });
      }
      case 'CLEAR_SLOT': {
        const oldValue = node.children;

        return update(node, {
          children: oldValue.filter((slot) => slot !== action.nodeId),
        });
      }
      default:
        return node;
    }
  },
  render(context, node, resolvedProps) {
    context.addImport('@mui/material', 'Stack', 'Stack');
    return `
      <Stack 
        ${context.renderRootProps(node.id)} 
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
