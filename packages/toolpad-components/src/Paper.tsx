import { Paper, PaperProps } from '@mui/material';
import { ComponentConfig } from '@mui/toolpad-core';
import withDefaultProps from './utils/addDefaultProps';

export default withDefaultProps(Paper, { elevation: 1 });

export const config: ComponentConfig<PaperProps> = {
  argTypes: {
    elevation: {
      typeDef: { type: 'number', minimum: 0 },
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
};
