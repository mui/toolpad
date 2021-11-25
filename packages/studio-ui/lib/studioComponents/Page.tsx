import { Container, Stack } from '@mui/material';
import * as React from 'react';
import type { StudioComponentDefinition, NodeId } from '../types';
import Slot, { Slots } from '../components/PageViewLegacy/Slot';
import { update } from '../utils/immutability';

interface PageComponentProps {
  children: NodeId[];
}

function PageComponent({ children, ...props }: PageComponentProps) {
  return (
    <Container {...props}>
      <Stack direction="column" gap={2} my={2}>
        {children.length > 0 ? (
          <Slots name="slots" direction="column">
            {children}
          </Slots>
        ) : (
          <Slot name="slot" content={null} />
        )}
      </Stack>
    </Container>
  );
}

const Page: StudioComponentDefinition<PageComponentProps> = {
  Component: React.memo(PageComponent),
  props: {},
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
    context.addImport('@mui/material/Container', 'default', 'Container');
    context.addImport('@mui/material/Stack', 'default', 'Stack');
    return `
      <Container 
        ${context.renderRootProps(node.id)} 
        ${context.renderProps(resolvedProps)}
      >
        <Stack 
          ${node.children.length > 0 ? context.renderSlots('slots', '"column"') : ''}
          direction="column" 
          gap={2} 
          my={2}
        >
          ${
            node.children.length > 0
              ? node.children.map((childId) => context.renderNode(childId)).join('\n')
              : context.renderPlaceholder('slot')
          }
        </Stack>
      </Container>
    `;
  },
};

export default Page;
