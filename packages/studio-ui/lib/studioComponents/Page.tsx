import * as React from 'react';
import type { StudioComponentDefinition } from '../types';

interface PageComponentProps {
  children?: React.ReactNode;
}

const Page: StudioComponentDefinition<PageComponentProps> = {
  props: {},
  render(context, resolvedProps, children) {
    context.addImport('@mui/material', 'Container', 'Container');
    context.addImport('@mui/material', 'Stack', 'Stack');
    return `
      <Container ${context.renderProps(resolvedProps)}>
        <Stack 
          direction="column" 
          gap={2} 
          my={2}
        >
          <Slots direction="column">
            ${children}
          </Slots>
        </Stack>
      </Container>
    `;
  },
};

export default Page;
