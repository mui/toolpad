import Stack, { StackProps } from '@mui/material/Stack';
import { createComponent, Slots } from '@mui/studio-core';
import * as React from 'react';

interface StackComponentProps extends StackProps {
  gap?: number;
  direction?: 'row' | 'column';
}

const StackComponent = React.forwardRef(function StackComponent(
  { children, ...props }: StackComponentProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <Stack ref={ref} {...props}>
      <Slots direction={props.direction || 'column'}>{children}</Slots>
    </Stack>
  );
});

export default createComponent(StackComponent, {
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
    children: {
      type: 'slots',
      getDirection: (props) => props.direction,
    },
  },
});
