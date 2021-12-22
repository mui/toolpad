import * as React from 'react';
import { createComponent, Slots } from '@mui/studio-core';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

interface PageComponentProps {
  children?: React.ReactNode;
}

const PageComponent = React.forwardRef(function PageComponent(
  { children, ...props }: PageComponentProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <Container ref={ref} {...props}>
      <Stack direction="column" gap={2} my={2}>
        <Slots direction="column">{children}</Slots>
      </Stack>
    </Container>
  );
});

export default createComponent(PageComponent, {
  props: {
    children: {
      type: 'slots',
      getDirection: () => 'column',
    },
  },
});
