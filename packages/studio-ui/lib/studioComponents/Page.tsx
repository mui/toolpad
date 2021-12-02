import * as React from 'react';
import type { StudioComponentDefinition } from '../types';

interface PageComponentProps {
  children?: React.ReactNode;
}

const Page: StudioComponentDefinition<PageComponentProps> = {
  props: {},
  render(context, node, resolvedProps) {
    context.addImport('@mui/material', 'Container', 'Container');
    context.addImport('@mui/material', 'Stack', 'Stack');
    return `
      <Container 
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
