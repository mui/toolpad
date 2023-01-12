import * as React from 'react';
import { Container as MUIContainer } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

interface Props {
  children: React.ReactNode;
  visible: boolean;
}

function Container({ children, visible, ...props }: Props) {
  return visible ? (
    <MUIContainer disableGutters sx={{ padding: 1 }} {...props}>
      {children}
    </MUIContainer>
  ) : null;
}

export default createComponent(Container, {
  argTypes: {
    children: {
      typeDef: { type: 'element' },
      control: { type: 'layoutSlot' },
    },
    visible: {
      typeDef: { type: 'boolean' },
      defaultValue: true,
      helperText: 'Control whether container element is visible.',
    },
  },
});
