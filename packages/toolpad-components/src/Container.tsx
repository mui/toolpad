import * as React from 'react';
import { Container as MUIContainer, ContainerProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import { SX_PROP_HELPER_TEXT } from './constants';

interface Props extends ContainerProps {
  visible: boolean;
}

function Container({ children, visible, sx, ...props }: Props) {
  return visible ? (
    <MUIContainer disableGutters sx={sx} {...props}>
      {children}
    </MUIContainer>
  ) : null;
}

export default createComponent(Container, {
  argTypes: {
    children: {
      type: 'element',
      control: { type: 'layoutSlot' },
      helperText: 'The content of the component.',
    },
    visible: {
      type: 'boolean',
      default: true,
      helperText: 'Control whether container element is visible.',
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
      default: { padding: 1, border: 'solid 1px' },
    },
  },
});
