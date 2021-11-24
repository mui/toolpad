import { Stack as InnerStackComponent, StackProps } from '@mui/material';
import React from 'react';
import type { StudioComponentDefinition, NodeId } from '../types';
import Slot, { Slots } from '../components/PageView/Slot';
import { update } from '../utils/immutability';

interface StackComponentProps extends StackProps {
  // TODO: support more values for gap and direction
  gap?: number;
  direction?: 'row' | 'column';
  children: NodeId[];
}

function StackComponent({ children, ...props }: StackComponentProps) {
  return (
    <InnerStackComponent {...props}>
      {children.length > 0 ? (
        <Slots name="slots" direction={props.direction || 'row'}>
          {children}
        </Slots>
      ) : (
        <Slot name="slot" content={null} />
      )}
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
  render(context, node) {
    context.addImport('@mui/material/Stack', 'default', 'Stack');
    return `
      <Stack 
        ${context.renderRootProps(node.id)} 
        ${
          node.children.length > 0
            ? context.renderSlots('slots', context.renderPropValueExpression(node.id, 'direction'))
            : ''
        } 
        ${context.renderProps(node.id)}
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
