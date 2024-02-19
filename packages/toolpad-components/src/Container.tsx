import * as React from 'react';
import { Container as MUIContainer, ContainerProps } from '@mui/material';
import createBuiltin from './createBuiltin';
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

export default createBuiltin(Container, {
  helperText: 'The Material UI [Container](https://mui.com/material-ui/react-container/).',
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
    },
  },
});
