import * as React from 'react';
import { createComponent } from '@mui/studio-core';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

interface PageComponentProps {
  children?: React.ReactNode;
}

const PageComponent = React.forwardRef<HTMLDivElement, PageComponentProps>(function PageComponent(
  { children, ...props }: PageComponentProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <Container ref={ref} {...props}>
      <Stack direction="column" gap={2} my={2}>
        {children}
      </Stack>
    </Container>
  );
});

export default createComponent(PageComponent, {
  props: {
    children: {
      // Let's go for a single "element" type with slots: boolean to enable/disable UI for it
      type: 'slots',
      defaultValue: null,
      getDirection: () => 'column',
    },
  },
});
