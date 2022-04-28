import { Container, ContainerProps } from '@mui/material';
import { ComponentConfig } from '@mui/toolpad-core';

export default Container;

export const config: ComponentConfig<ContainerProps> = {
  argTypes: {
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
};
