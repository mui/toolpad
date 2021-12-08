import * as React from 'react';
import { createComponent } from '@mui/studio-core';
import { Container, Stack } from '@mui/material';

interface PageComponentProps {
  children?: React.ReactNode;
}

function PageComponent({ children, ...props }: PageComponentProps) {
  return (
    <Container {...props}>
      <Stack direction="column" gap={2} my={2}>
        {children}
      </Stack>
    </Container>
  );
}

export default createComponent(PageComponent, {
  props: {},
});
