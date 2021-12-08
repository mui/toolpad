import * as React from 'react';
import { createComponent, Slots } from '@mui/studio-core';
import { Container, Stack } from '@mui/material';

interface PageComponentProps {
  children?: React.ReactNode;
}

function PageComponent({ children, ...props }: PageComponentProps) {
  return (
    <Container {...props}>
      <Stack direction="column" gap={2} my={2}>
        <Slots direction="column">{children}</Slots>
      </Stack>
    </Container>
  );
}

export default createComponent(PageComponent, {
  props: {},
});
